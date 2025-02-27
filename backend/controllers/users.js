const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt');
const { get } = require('../routes/api');

const prisma = new PrismaClient();

const createUser = async (req, res) => {
    const { username, password, role } = req.body;
  
    // Hash the password
    const hashResult = await bcrypt.hash(password, 256);
    // 256 = salt (การสุ่มค่าเพื่อเพิ่มความซับซ้อนในการเข้ารหัส)
  
    // Store the user data
    const userData = {
      UserName: username,
      Role: role,
      Status: 'Active',
      Password: hashResult
    };
  
    try {
        const user = await prisma.users.create({
            data: userData
        });
        res.status(200).json({message: 'ok'});
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "insert user data fail!",
        error,
      });
    } 
  }

  const getAllUsers = async (req, res) => {
    try {
      const users = await prisma.users.findMany(); // ดึงข้อมูลผู้ใช้ทั้งหมด
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve users', error });
    }
  };

  const getUser = async (req, res) => {
    const { id } = req.params;
    try {
      const user = await prisma.users.findUnique({
        where: { UserID: parseInt(id) },
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found!' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve user data', error });
    }
  };
  
  const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, role, status } = req.body;
  
    try {
      // ตรวจสอบและเข้ารหัสรหัสผ่านใหม่หากมีการเปลี่ยนแปลง
      const hashResult = password ? await bcrypt.hash(password, 256) : undefined;
  
      const updatedUser = await prisma.users.update({
        where: { UserID: parseInt(id) },
        data: {
          UserName: username,
          Password: hashResult || undefined,
          Role: role,
          Status: status,
        },
      });
  
      res.status(200).json({ message: 'User updated successfully', updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update user data', error });
    }
  };
  
  const deleteUser = async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedUser = await prisma.users.delete({
        where: { UserID: parseInt(id) },
      });
  
      res.status(200).json({ message: 'User deleted successfully', deletedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete user data', error });
    }
  };
  
  module.exports = { 
    createUser,getUser,updateUser,deleteUser, getAllUsers
}