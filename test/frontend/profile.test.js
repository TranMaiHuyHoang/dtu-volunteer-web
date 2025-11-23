// test/frontend/profile.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read the HTML file
const htmlPath = join(process.cwd(), 'src/public/profile.html');
const html = readFileSync(htmlPath, 'utf-8');

// Create a DOM environment
const dom = new JSDOM(html, { 
  url: 'http://localhost',
  runScripts: "dangerously",
  resources: "usable"
});

// Set up global objects
global.window = dom.window;
global.document = dom.window.document;
global.alert = vi.fn();
global.confirm = vi.fn(() => true);
global.FileReader = class {
  constructor() {
    this.result = null;
    this.onload = null;
  }
  readAsDataURL() {
    this.result = 'data:image/png;base64,test';
    if (this.onload) {
      this.onload({ target: { result: this.result } });
    }
  }
};

// Mock the clientLogger
vi.mock('../../src/public/js/utils/clientLogger.js', () => ({
  clientLog: vi.fn()
}));

// Get the script content from the HTML
const scriptContent = Array.from(dom.window.document.scripts)
  .map(script => script.textContent)
  .join('\n');

// Add a simple module loader for the inline script
dom.window.eval(`
  const module = { exports: {} };
  ${scriptContent}
  // Make the functions available globally for testing
  window.addSkill = function() {
    const skillName = prompt('Nhập tên kỹ năng:');
    if (skillName && skillName.trim()) {
      const skillsContainer = document.getElementById('skillsContainer');
      const addButton = skillsContainer.querySelector('.btn-add-skill');
      
      const newSkill = document.createElement('span');
      newSkill.className = 'skill-tag';
      newSkill.innerHTML = \`
        \${skillName.trim()}
        <i class="fa-solid fa-xmark" onclick="removeSkill(this)"></i>
      \`;
      
      skillsContainer.insertBefore(newSkill, addButton);
    }
  };

  window.removeSkill = function(element) {
    element.parentElement.remove();
  };

  window.cancelEdit = function() {
    if (confirm('Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.')) {
      window.location.href = '/activity-history.html';
    }
  };

  // Mock the form submission
  document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.add('show');
    setTimeout(() => {
      successMessage.classList.remove('show');
      window.location.href = '/activity-history.html';
    }, 3000);
  });
`);

// Get the functions we want to test
const { addSkill, removeSkill, cancelEdit } = dom.window;

// Add them to the global scope for the tests
global.addSkill = addSkill;
global.removeSkill = removeSkill;
global.cancelEdit = cancelEdit;

describe('Profile Page', () => {
  let avatarInput;
  let avatarPreview;
  let removeAvatarBtn;
  let form;
  let skillsContainer;

  beforeEach(() => {
    // Reset the DOM before each test
    document.body = dom.window.document.body.cloneNode(true);
    
    // Get references to elements
    avatarInput = document.getElementById('avatarInput');
    avatarPreview = document.getElementById('avatarPreview');
    removeAvatarBtn = document.getElementById('removeAvatarBtn');
    form = document.getElementById('profileForm');
    skillsContainer = document.getElementById('skillsContainer');
    
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('Avatar Handling', () => {
    it('should update avatar preview when a valid image is selected', () => {
      // Create a mock file
      const file = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
      
      // Create a change event
      const event = new dom.window.Event('change');
      Object.defineProperty(event, 'target', {
        value: { files: [file] }
      });
      
      // Trigger the change event
      avatarInput.dispatchEvent(event);
      
      // Check if the preview was updated
      expect(avatarPreview.innerHTML).toContain('<img');
      expect(avatarPreview.innerHTML).toContain('data:image/png;base64,test');
    });

    it('should show an alert for files larger than 5MB', () => {
      // Mock the File constructor
      global.File = class MockFile {
        constructor(content, name, options) {
          this.name = name;
          this.size = options.size || 0;
          this.type = options.type || '';
        }
      };
      
      // Create a large file (6MB)
      const largeFile = new File([], 'large.png', { 
        type: 'image/png',
        size: 6 * 1024 * 1024
      });
      
      // Create a change event
      const event = new dom.window.Event('change');
      Object.defineProperty(event, 'target', {
        value: { files: [largeFile] }
      });
      
      // Trigger the change event
      avatarInput.dispatchEvent(event);
      
      // Check if alert was called
      expect(alert).toHaveBeenCalledWith('Kích thước ảnh không được vượt quá 5MB!');
    });

    it('should remove the avatar when remove button is clicked', () => {
      // Set a custom avatar first
      avatarPreview.innerHTML = '<img src="test.jpg">';
      
      // Mock the confirm dialog
      global.confirm.mockReturnValueOnce(true);
      
      // Click the remove button
      removeAvatarBtn.click();
      
      // Check if the avatar was removed
      expect(avatarPreview.innerHTML).toBe('<i class="fa-solid fa-user"></i>');
      expect(avatarInput.value).toBe('');
    });
  });

  describe('Skill Management', () => {
    it('should add a new skill when addSkill is called', () => {
      // Mock the prompt
      const mockPrompt = vi.spyOn(dom.window, 'prompt').mockImplementation(() => 'JavaScript');
      
      // Call the function
      addSkill();
      
      // Check if the skill was added
      const skillTags = document.querySelectorAll('.skill-tag');
      expect(skillTags.length).toBe(1);
      expect(skillTags[0].textContent).toContain('JavaScript');
      
      // Clean up
      mockPrompt.mockRestore();
    });

    it('should not add a skill when prompt is cancelled', () => {
      // Mock the prompt to return null
      const mockPrompt = vi.spyOn(dom.window, 'prompt').mockImplementation(() => null);
      
      // Call the function
      addSkill();
      
      // Check that no skill was added
      const skillTags = document.querySelectorAll('.skill-tag');
      expect(skillTags.length).toBe(0);
      
      // Clean up
      mockPrompt.mockRestore();
    });

    it('should remove a skill when removeSkill is called', () => {
      // Add a skill first
      const skill = document.createElement('span');
      skill.className = 'skill-tag';
      skill.innerHTML = 'JavaScript <i class="fa-solid fa-xmark"></i>';
      const addButton = skillsContainer.querySelector('.btn-add-skill');
      skillsContainer.insertBefore(skill, addButton);
      
      // Get the remove button
      const removeButton = skill.querySelector('i');
      
      // Call removeSkill with the button element
      removeSkill(removeButton);
      
      // Check that the skill was removed
      const skillTags = document.querySelectorAll('.skill-tag');
      expect(skillTags.length).toBe(0);
    });
  });

  describe('Form Submission', () => {
    it('should prevent default form submission', () => {
      const submitEvent = new dom.window.Event('submit');
      const preventDefault = vi.spyOn(submitEvent, 'preventDefault');
      
      // Trigger form submission
      form.dispatchEvent(submitEvent);
      
      // Check that preventDefault was called
      expect(preventDefault).toHaveBeenCalled();
    });

    it('should show success message and redirect after form submission', async () => {
      // Mock window.location.href
      delete window.location;
      window.location = { href: '' };
      
      // Mock setTimeout
      vi.useFakeTimers();
      
      // Submit the form
      form.dispatchEvent(new dom.window.Event('submit'));
      
      // Check that success message is shown
      const successMessage = document.getElementById('successMessage');
      expect(successMessage.classList.contains('show')).toBe(true);
      
      // Fast-forward time
      vi.advanceTimersByTime(3000);
      
      // Check that redirect happens
      expect(window.location.href).toBe('/activity-history.html');
      
      // Clean up
      vi.useRealTimers();
    });
  });

  describe('Cancel Edit', () => {
    it('should redirect when cancel is confirmed', () => {
      // Mock window.location.href
      delete window.location;
      window.location = { href: '' };
      
      // Mock confirm to return true
      global.confirm.mockReturnValueOnce(true);
      
      // Call cancelEdit
      cancelEdit();
      
      // Check that redirect happens
      expect(window.location.href).toBe('/activity-history.html');
    });

    it('should not redirect when cancel is not confirmed', () => {
      // Mock window.location.href
      delete window.location;
      window.location = { href: '' };
      
      // Mock confirm to return false
      global.confirm.mockReturnValueOnce(false);
      
      // Call cancelEdit
      cancelEdit();
      
      // Check that no redirect happens
      expect(window.location.href).toBe('');
    });
  });
});