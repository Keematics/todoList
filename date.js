// THESE ARE MODULES

//instead of module.exports, I can use exports - as below, and it still works
exports.getDate = function() { // this is function expression
    // the parenthesis is not added because I don't want to call the function [ to executed] as soon as it is exported
    //Javascript export is an object

    const today = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    }

   return today.toLocaleDateString("en-US", options);
}





exports.getDay = function() {

    const today = new Date();
    const options = {
        weekday: "long",
        // day: "numeric"
    }

   return today.toLocaleDateString("en-US", options);

}