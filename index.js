const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const dbconfig = require("./config/database.js");
const connection = mysql.createConnection(dbconfig);
const database = [
  {
    id: 1,
    title: "글1",
  },
  {
    id: 2,
    title: "글2",
  },
  {
    id: 3,
    title: "글3",
  },
];

// nodemon 설치했는데 제대로 작동되는지 확인할 것!!

const app = express();

// configuration =========================
app.set("port", process.env.PORT || 3000);

// http://localhost:3000
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/index.html"));
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 로그인 기능은 카카오톡 로그인도 추가로 해볼 것!!

app.get("/dashboard", (req, res) => {
  connection.query("SELECT * from Dashboards", (error, rows) => {
    if (error) throw error;
    console.log("글 작성 테이블 : ", rows);
    res.send(rows);
  });
});

app.get("/dashboard", (req, res) => {
  connection.query("SELECT * from Comments", (error, rows) => {
    if (error) throw error;
    console.log("댓글 테이블 : ", rows);
    res.send(rows);
  });
});

app.get("/login", (req, res) => {
  connection.query("SELECT * from Users", (error, rows) => {
    if (error) throw error;
    console.log("유저 테이블 : ", rows);
    res.send(rows);
  });
});

app.post("/signup", (req, res) => {
  let users = req.body;
  console.log(users);
  connection.query(
    `INSERT INTO Users (userid,email,password,birthday,gender,createtime,updatetime)
    VALUES ('${users.userId}','${users.email}','${users.password}','${users.birthday}','${users.gender}','${users.createtime}','${users.updatetime}')`,
    (error, rows) => {
      if (error) throw error;
      console.log("유저 정보 전달 : ", rows);
      res.send(rows);
    }
  );
});

// CRUD
// 글 조회
app.get("/database", (req, res) => {
  res.send(database);
});

// 글 생성
app.post("/database", (req, res) => {
  const title = req.body.title;

  database.push({
    id: database.length + 1,
    title,
  });

  res.send("값 추가가 정상적으로 완료되었습니다.");
});

// 특정 글 조회
app.post("/database/:id", (req, res) => {
  const id = req.params.id; // string 이니까 나중에 숫자로 바꿔줘야함
  const data = database.find((el) => el.id === Number(id));
  res.send(data);
});

// 글 수정
app.put("/database", (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  database[id - 1].title = title;

  res.send("수정 완료");
});

// 글 삭제
app.delete("/database", (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  database.splice(id - 1, 1); // 여기서는 글 한개만 삭제하는 거임

  res.send("삭제 완료");
});

app.listen(app.get("port"), () => {
  console.log(
    "Express server listening on port ... " +
      "http://localhost:" +
      app.get("port")
  );
});
