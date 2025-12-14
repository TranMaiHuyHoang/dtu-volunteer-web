function getActivity() {
    // Function implementation goes here
    return "Activity data";
}

function hoang() {
    console.log("This is the hoang module.");
}

function newFunction() {
    console.log("This is a new function.");
}

module.exports = {
    getActivity,
    hoang,
    newFunction
};

function unusedFunction() {
    console.log("This function is not used.");
}