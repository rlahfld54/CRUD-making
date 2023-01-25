const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const dbconfig = require("./config/database.js");
const connection = mysql.createConnection(dbconfig);
// const database = [
//   {
//     id: 1,
//     title: "글1",
//   },
//   {
//     id: 2,
//     title: "글2",
//   },
//   {
//     id: 3,
//     title: "글3",
//   },
// ];

// nodemon 설치했는데 제대로 작동되는지 확인할 것!!

const app = express();
connection.connect();

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
    if (error) {
      throw error;
    }
    console.log("글 작성 테이블 : ", rows);
    res.send(rows);
  });
});

app.get("/dashboard", (req, res) => {
  connection.query("SELECT * from Comments", (error, rows) => {
    if (error) {
      throw error;
    }
    console.log("댓글 테이블 : ", rows);
    res.send(rows);
  });
});

// 로그인
app.get("/login", (req, res) => {
  let loginUser = req.body;
  console.log(loginUser);

  // 일치하는 유저가 있는지 검색 중..
  connection.query(
    `SELECT * from Users Where userid ='${loginUser.userId}' And password = '${loginUser.password}'`,
    (error, rows) => {
      if (error) {
        throw error;
      }

      res.send("유저를 찾았습니다.");
    }
  );
});

// 회원가입
app.post("/signup", (req, res) => {
  // 클라이언트에서 받은 회원가입 데이터가 이미 저장되어있는지 확인해야한다.
  // 기존 정보들과 비교해서 중복 된 것이 없다면 삽입쿼리를 실행하고
  // 중복된 유저가 이미 있다면 중복된 유저가 있다고 클라이언트에 알려줘야한다.
  // 그런데 여기에는 중복체크는 안되어있다.
  let users = req.body;
  console.log(users);

  connection.query(
    `INSERT INTO Users (userid,email,password,birthday,gender,createtime,updatetime)
    VALUES ('${users.userId}','${users.email}','${users.password}','${users.birthday}','${users.gender}','${users.createtime}','${users.updatetime}')`,
    (error, rows) => {
      if (error) throw error;
      // if (!error === null) console.log(error);
      console.log("회원가입을 성공했습니다.");
      res.send();
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
