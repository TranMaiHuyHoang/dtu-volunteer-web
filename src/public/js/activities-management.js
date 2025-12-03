import { fetchApi } from './utils/fetchApi.js';

document.addEventListener('DOMContentLoaded', async () => {
    const activityTableBody = document.getElementById('activity-table-body');
    const activityForm = document.getElementById('activity-form');

    // Fetch activities data and populate the table
    const activitiesResponse = await fetchApi('/activities', 'GET');
    const activitiesData = activitiesResponse.data?.data || [];

    activitiesData.forEach(activity => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${activity._id}</td>
            <td>${activity.title}</td>
            <td>${activity.organizer}</td>
            <td>${activity.location}</td>
            <td>${activity.registered}</td>
            <td>${activity.capacity}</td>
            <td>${activity.status}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;
        activityTableBody.appendChild(row);
    });

    // Handle form submission
    activityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(activityForm);
        const activityData = Object.fromEntries(formData.entries());

        // Send form data to the server
        const response = await fetchApi('/activities', 'POST', activityData, { useSession: true });
        console.log(response.data);
    });
});