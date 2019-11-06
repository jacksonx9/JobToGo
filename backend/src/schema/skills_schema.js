import mongoose from 'mongoose';


const skillsSchema = new mongoose.Schema({
  skills: [String],
},
{
  versionKey: false,
});

const Skills = mongoose.model('Skills', skillsSchema);

export default Skills;
