const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql2");
const dbconfig = require("./config/database.js");
const connection = mysql.createConnection(dbconfig);
// 암호화 라이브러리.. recommended
const bcrypt = require("bcrypt");
const saltRounds = 10;
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
connection.connect();

// configuration =========================
app.set("port", process.env.PORT || 3000);

// http://localhost:3000
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/index.html"));
});

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
app.post("/login", (req, res, next) => {
  let loginUser = req.body;
  console.log(loginUser);

  const hash = bcrypt.hashSync(loginUser.password, saltRounds);
  bcrypt.compare(loginUser.password, hash, (err, same) => {
    if (err) {
      return next(err);
    }
    console.log("로그인 성공 시 쿠키 생성"); //=> true
    // 로그인 성공 시 쿠키 생성
    // js에서 접근하는 상황을 방지하기 위해 httponly 옵션을 설정..흠...
    if (same) {
      res.cookie("user", loginUser.userId, {
        expires: new Date(Date.now() + 900000),
        httpOnly: true,
      });
      res.send("success");
    }
  });
});

// 로그아웃
app.get("/logout", (req, res) => {
  console.log("로그아웃함");
  res.send();
});

// 회원가입
app.post("/signup", (req, res, next) => {
  // 클라이언트에서 받은 회원가입 데이터가 이미 저장되어있는지 확인해야한다.
  // 기존 정보들과 비교해서 중복 된 것이 없다면 삽입쿼리를 실행하고
  // 중복된 유저가 이미 있다면 중복된 유저가 있다고 클라이언트에 알려줘야한다.
  // 그리고 암호화를 해준다. crypto 모듈 설치해서 사용
  let users = req.body;
  console.log(users);

  var query = `SELECT userId FROM Users WHERE userId ='${users.userId}'`; // 중복 아이디 체크
  connection.query(query, (error, rows) => {
    if (error) throw error;
    if (rows.length == 0) {
      //비밀번호 암호화 하기
      let hashPassword = {
        password: "",
      };
      bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(users.password, salt, function (err, hash) {
          // Store hash in your password DB.
          if (err) return next(err);
          console.log("해쉬 : " + hash);
          hashPassword.password = hash;
          console.log("해쉬 담음 : " + hashPassword.password);
          // sql제대로 연결되고 중복이 없는 경우
          var query = `INSERT INTO Users (userid,email,password,birthday,gender,createtime,updatetime) VALUES ('${users.userId}','${users.email}','${hashPassword.password}','${users.birthday}','${users.gender}','${users.createtime}','${users.updatetime}')`;
          connection.query(query, (error, rows) => {
            if (error) {
              throw error;
            } else {
              console.log("회원가입을 성공했습니다.");
              res.send("success");
            }
          });
        });
      });
    } else if (rows.length > 0) {
      res.send("dup-userid");
    }
  });
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
