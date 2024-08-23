import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
   
    httpOnly: false,    
  sameSite: 'lax',  
  secure: false,      
  maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  console.log("cook",res.cookie)
};


export default generateToken;
