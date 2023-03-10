const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2");
const dbconfig = require("./config/database.js");
const connection = mysql.createConnection(dbconfig);
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: true, // 출처 허용 옵션
    credential: true, // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
  })
);
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
  // 로그인 후에도 계속 유지가 되어야한다. 그래야 글쓸때 관리자인지, 일반 유저인지,
  // 로그인 안한 방문자인지 알수 있고 권한도 다르다. 이때 쓰는 것이 Auth임
  let loginUser = req.body;
  console.log(loginUser);

  const hash = bcrypt.hashSync(loginUser.password, saltRounds);
  bcrypt.compare(loginUser.password, hash, (err, same) => {
    if (err) {
      return next(err);
    }
    console.log("로그인 성공 시 쿠키 생성"); //=> true
    // 로그인 성공 시 쿠키 생성
    // js에서 접근하는 상황을 방지하기 위해 httponly 옵션을 설정을 하면 클라이언트에 전달안된다는데..?ㅋㅋ
    if (same) {
      res.cookie("user", loginUser.userId);
      res.send();
    }
  });
});

// 로그아웃  => 로그인과 마찬가지로 post 추천됨
app.post("/logout", (req, res) => {
  res.clearCookie("user");
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
    if (rows.length > 0) {
      console.log("이미 등록된 사용자입니다");
      res.send("dup-userid");
    } else {
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
    }
  });
});

// dashboard 글쓰기 기능
// 글 생성
app.post("/write", (req, res) => {
  console.log(req.body);
  let user = req.body;
  let query = `INSERT INTO Dashboards (title,content,regdate,userid) VALUES ('${user.title}','${user.contents}','${user.currentTime}','${user.userid}')`;
  connection.query(query, (error, rows) => {
    if (error) {
      throw error;
    } else {
      console.log("회원가입을 성공했습니다.");
      res.send("success");
    }
  });
});

// -------------------------------------------------------------//

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
