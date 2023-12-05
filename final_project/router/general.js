const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



public_users.post("/register", (req,res) => {
  //Write your code here
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (!isValid(username)) {
            users.push({"username":username,"password":password});
            return res.status(200).json({message:"Customer successfully registered. Now you can log in"});
        }
        else {
            return res.status(400).json({message:"Customer already registered"});
        }
    }
    else {
        return res.status(404).json({message: "Username and Password are needed"});
    }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books,null,4));
});

//books async callbacks
public_users.get("/server/asynbooks", async function (req,res) {
    try {
      let response = await axios.get("http://localhost:5000/");
      console.log(response.data);
      return res.status(200).json(response.data);
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({message: "Failed to get book list"});
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if (books[isbn]) {
      return res.json(books[isbn]);
  } else {
      return res.status(404).json({ message: "Book not found" });
  }
 });

//isbn promis callbacks
 function getByISBN(isbn) {
    return new Promise((resolve, reject) => {
        let isbnNum = parseInt(isbn);
        if (books[isbnNum]) {
            resolve(books[isbnNum]);
        } else {
            reject({status:404, message:`ISBN ${isbn} not found`});
        }
    })
}
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;  
  const authorBooks = [];  
  
  for (const book in books) {  
    if (books[book].author === author) {  
      authorBooks.push(books[book]);
    }
  }
  
  if (authorBooks.length > 0) {  
    res.send(authorBooks);  
  } else {
    res.status(404).send('No books found for author');  
  }
});

//author promises
public_users.get("/server/asynbooks/author/:author", function (req,res) {
    let {author} = req.params;
    axios.get(`http://localhost:5000/author/${author}`)
    .then(function(response){
      console.log(response.data);
      return res.status(200).json(response.data);
    })
    .catch(function(error){
        console.log(error);
        return res.status(500).json({message: "Failed to get book details."})
    })
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title.toLowerCase();
    const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
    if(filteredBooks.length > 0){
        return res.status(200).json(filteredBooks);
    }
    else{
        return res.status(404).json({message: "Book not found"});
    }
});

//title promises
public_users.get("/server/asynbooks/title/:title", function (req,res) {
    let {title} = req.params;
    axios.get(`http://localhost:5000/title/${title}`)
    .then(function(response){
      console.log(response.data);
      return res.status(200).json(response.data);
    })
    .catch(function(error){
        console.log(error);
        return res.status(500).json({message: "Failed to get book details."})
    })
  });
  

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    const reviews = books[isbn].reviews;
    return res.status(200).json({ reviews: reviews });
});

module.exports.general = public_users;
