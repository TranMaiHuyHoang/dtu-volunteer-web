// /test/basic.test.js

import { expect, test } from 'vitest';

// Đây là một hàm đơn giản mà chúng ta muốn kiểm thử
const sayHello = (name) => {
    return `Hello, ${name}!`;
};

// Khai báo một test suite
test('sayHello function', () => {
    // Test case 1: Kiểm tra xem hàm có trả về chuỗi chính xác hay không
    const result = sayHello('World');
    
    // Sử dụng expect để xác nhận kết quả
    expect(result).toBe('Hello, World!');
});

// Hoặc một test đơn giản hơn nếu bạn đã bật globals: true trong cấu hình
describe('Environment Check', () => {
    it('should confirm that 1 plus 1 equals 2', () => {
        expect(1 + 1).toBe(2);
    });
});