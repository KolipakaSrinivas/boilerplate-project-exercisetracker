const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require("mongoose")

app.use(express.json());
app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));


const option = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, option)
    console.log('😊 😊 connected to db')
  } catch (error) {
    console.log('error =>', error)
  }
}
connectDb()
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

/*** Schema ***/
const UserSchema = new mongoose.Schema({
  username:String
});

const ExerciseSchema = new mongoose.Schema({
  user_id:{type:String,required:true},
  description:String,
  duration:Number,
  date:Date,
})
/** Models ***/
const UserModel =  mongoose.model("Users",UserSchema);
const ExerciseModel = mongoose.model("Exercise",ExerciseSchema);


app.post("/api/users", async (req,res) =>{
  const {username} = req.body
  try{
     const newUserObect = new UserModel({
      username:username
     })
     const user = await newUserObect.save()

     res.json({
      _id:user._id,
      username:user.username
     })
  }catch(error) {
    console.log(error)
  }
})

app.get("/api/users",async (req,res) =>{
  try {
    const qurey = await UserModel.find({}).select("_id username")
    res.json(qurey)
  } catch (error) {
    console.log(error)
  }
})

app.post("/api/users/:_id/exercises", async (req,res)=>{
  const id = req.params._id;
  console.log(id)
  const {description,duration,date} = req.body
  try {
    const user = await UserModel.findById(id)
    if(!user) {
      res.send("user could not found")
    } else {
      const exerciseobj = await new ExerciseModel({
        user_id:user._id,
        description,
        duration,
        date:date ? new Date(date) : new Date()
      })
      const exercise = await exerciseobj.save()
      res.json({
        _id:user._d,
        username:user.username,
        description:exercise.description,
        duration:exercise.duration,
        date: new Date(exercise.date).toDateString()
      })
    }
  } catch (error) {
    console.log(error)
  }
})


app.get("/api/users/:_id/logs", async (req,res) =>{
  const {from,to,limit} = req.query;
  const id = req.params._id;

  try {
    const user = await UserModel.findById(id)
    if(!user) {
      res.send("could not find")
    }

 let dateObj = {}
  if (from) {
    dateObj["$gte"] = new Date(from)
  }
  if (to){
    dateObj["$lte"] = new Date(to)
  }
  let filter = {
    user_id: id
  }
  if(from || to){
    filter.date = dateObj;
  }

    const exercises = await Exercise.find(filter).limit(+limit ?? 500)
    const log = exercise.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString()
    }))



    res.json({
      username: user.username,
      count: exercise.length,
    _id: user._id,
    log,
    })

  } catch (error) {
    console.log(error)
  }



})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
