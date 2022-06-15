const express = require("express")
const bodyParser = require("body-parser");
const _ = require("lodash");
// const date = require(__dirname + "/date.js"); // I use __dirname here because I am accessing the file locally
// parenthesis will be added to the variable 'date' which the function is assigned, to be called anywhere will need it.

//mongoose
const mongoose = require("mongoose");

//const items = ["buy food", "cook food", "eat food"]; // These are the default items in my todo lists
//const workItems = [];

const app = express();

app.set("view engine", "ejs"); // ejs = embedded javascript, this is how it's set in nodejs and it was install with npm(ejs.co = for proper documentation)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // This tells express to locate some static files I have inside the public folder

mongoose.connect("mongodb+srv://iKeem:admin123@cluster0.avoley4.mongodb.net/todolistDB", { useNewUrlParser: true });


const itemsShema = new mongoose.Schema({
    name: String
})

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsShema]
});

const Item = mongoose.model("Item", itemsShema);
const List = mongoose.model("List", listSchema);

//creating the todo list
const food = new Item({
    name: "Eat food"
})
const game = new Item({
    name: "Play game"
})
const sleep = new Item({
    name: "frequent sleeping"
})



const defaultItems = [food, game, sleep];


app.get("/", function (req, res) {
    Item.find({}, (err, foundItems) => { // using model.find({}) will return an array while model.findOne({}) will return an object

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Successfully saved default Items to DB.");
                }
            })
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    })
    // mongoose.disconnect();


    // let day = date.getDate();


    // newListItems is the only array that my list.ejs understand and it's been set to hold the same values the todo list array holds as well
});

app.post("/", (req, res) => {

    let itemName = req.body.newItem;
    let listName = req.body.list; // this grabs the submit button of the page and stores it in listName variable

    const item = new Item({ // this is used to create the new item in our todo list
        name: itemName // the todo list item is stored in the name key
    });

    if (listName === "Today") { //if the value of the button where the todo list item is added it "Today", which means, it's in the root route(home page)
        item.save(); //the item should be saved into the item collection,
        res.redirect("/"); // and then redirected to the root route.
    } else {
        List.findOne({ name: listName }, (err, foundList) => { // else, go to the list collection inside todolistDB and find the name key with the value which the 
            // which the button holds, that is stored into a variable called foundList,
            foundList.items.push(item); //then add the newly created todo list into the variable key(items),
            foundList.save(); // the foundList variable then saves the item,
            res.redirect("/" + listName); // and the browser will be redirected to the route where the submit button was clicked which holds the value of the 
            // page title as well to display the added item, e.g if it was clicked from School route, it will be redirected to school route instead of home
        });
    }
});


//delete route
app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.deleteOne({ _id: checkedItemId }, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully deteled the item!")
                res.redirect("/");
            }
        })
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, (err, foundList) => {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }

});

//creating a custom route
app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                //Create new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);
            } else {
                //Show an existing list
                //console.log(foundList)
                // console.log(foundList.items)
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });

            }
        }
    })

});

// about page
app.get("/about", (req, res) => {
    res.render("about");

});




// SETTING HEROKU PORT, TO BE ABLE TO ACCESS IT ON WEB AND LOCALLY
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("The server has started successfully!");
});


// USING HEROKU
//1. LOG IN ON HEROKU WEBSITE AND FOLLOW THE DOCUMENTATION - git init, git add ., git commit -m "",....
//2. TYPE heroku login IN THE CLI TO LOG IN
//3. TYPE heroku create IN THE CLI TO CREATE NEW APP
//4. CREATE A "Procfile" FILE IN THE APP ROOT WITH NO EXTENSION - touch Procfile
//5. SETTING HEROKU PORT
//6. USING DATABASE - IT'S BEEN SET ALREADY ON MONGODB ATLAS, SO I SKIPPED IT.
//7. COMPLETE LANGUAGE SPECIFIC SETUP - ADDING THE CURRENT VERSION OF NODE TO THE package.json FILE

//8. CREATE .gitignore FILE - touch .gitignore, THE SAMPLE FILES PROVIDED ON HEROKU DOCUMENTATION ARE ADDED e.g node_modules...