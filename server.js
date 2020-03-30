const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
var os = require("os");

const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use("/", express.static(path.resolve(__dirname, "static")));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});
app.post("/", async (req, res) => {
  let { package, nickname, password } = req.body;
  let errors = [];
  if (!package) {
    errors.push("Package is required");
  }
  if (!nickname || nickname.length <= 0) {
    errors.push("Nickname is required");
  }
  if (!password || password.length <= 0) {
    errors.push("Password is required");
  }
  let oldContent = "";
  if (errors.length <= 0) {
    try {
      oldContent = fs.readFileSync(path.resolve("../", "users.ini")).toString();
      let lines = oldContent.split("\n");
      let start = false;
      let IDs = [];
      for (let line of lines) {
        if (!start && line.toLowerCase().replace(/\s+/g, "") == ";start") {
          start = true;
        } else if (start) {
          line = line.trim();
          if (line.length > 0) {
            let data = line.split(" ");
            let ID = data[0].replace(/(\"|\s)+/g, "");
            IDs.push(ID);
          }
        }
      }
      if (!start) {
        res.send("Something went wrong #SLM");
        return;
      }
      for (let id of IDs) {
        if (id.toLowerCase() == nickname.toLowerCase()) {
          errors.push(`${nickname} is already taken.`);
        }
      }
    } catch (ex) {
      res.send("Something went wrong #FNF");
      return;
    }
  }
  if (errors.length > 0) {
    res.render("index", {
      errors,
      package,
      nickname,
      password
    });
  } else {
    let flags = "";
    switch (package) {
      case "head":
        flags += '"bcdefghijklmnopqrstu"';
        break;
      case "full":
        flags += '"bcdeghijklmnopqrstu"';
        break;
      case "vip":
        flags += '"gijklmnopqrstu"';
        break;
      default:
        res.send("Package not exist");
    }
    oldContent += os.EOL + `"${nickname}" "${password}" ${flags} "a"` + os.EOL;
    fs.writeFileSync(path.resolve("../", "users.ini"), oldContent);
    res.render("index", {
      message: "Your account has been created successfully."
    });
  }
});
app.listen(80, () => {
  console.log("Server started in port 80");
});
