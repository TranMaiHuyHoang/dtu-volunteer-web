export const getGroupById = async (groupId) => {
    const response = await fetchApi(`/groups/${groupId}`);
    const groupData = await response.json();
    return groupData;
};

// Add more content here
export const getAnotherGroup = async (groupId) => {
    const response = await fetchApi(`/groups/${groupId}/another-group`);
    const anotherGroupData = await response.json();
    return anotherGroupData;
};
