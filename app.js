//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// connecting with database if database is not there it will be created
mongoose.connect("mongodb://localhost:27017/todolistDB", function (err) {
  if (err) console.log(err);
  else {
    console.log("connected with db");
  }
});
// Schema for items collection
const itemsSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});
// model for items collection
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "first",
});
const item2 = new Item({
  name: "second",
});
const item3 = new Item({
  name: "third",
});

app.get("/", function (req, res) {
  const day = "Today";
  Item.find({}, function (err, foundItems) {
    res.render("list", { listTitle: day, newListItems: foundItems });
  });
});

// express route parameter
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: [],
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("List", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    } else {
      console.log("error");
    }
  });
});
// Property.findByIdAndRemove(req.params.propertyId,req.body, function(err,data)
// {
//     if(!err){
//         console.log("Deleted");
//     }
// });
app.post("/delete", function (req, res) {
  const listName = req.body.listName;
  if (listName == "Today") {
    Item.findByIdAndRemove(req.body.checkbox, function (err) {
      if (!err) {
        console.log("deleted");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: req.body.checkbox } } },
      function (err, foundItem) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});
app.post("/", function (req, res) {
  const item = req.body.newItem;
  console.log(req.body.list);
  const redirectPage = req.body.list;
  // document using model
  const itemToInsert = new Item({
    name: item,
  });
  if (redirectPage == "Today") {
    // inserting document into collection
    itemToInsert.save();

    res.redirect("/");
  } else {
    List.findOne({ name: redirectPage }, function (err, foundItem) {
      foundItem.items.push(itemToInsert);
      console.log(foundItem.items);
      foundItem.save();
      res.redirect("/" + redirectPage);
    });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
