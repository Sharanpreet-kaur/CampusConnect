import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Please fill all fields' })

    const userExists = await User.findOne({ email })
    if (userExists)
      return res.status(400).json({ success: false, message: 'Email already registered' })

    const user  = await User.create({ name, email, password })
    const token = generateToken(user._id)

    res.status(201).json({
      success: true, token,
      user: { _id: user._id, name: user.name, email: user.email, city: user.city, phone: user.phone }
    })
  } catch (err) { next(err) }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' })

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' })

    const token = generateToken(user._id)

    res.status(200).json({
      success: true, token,
      user: { _id: user._id, name: user.name, email: user.email, city: user.city, phone: user.phone }
    })
  } catch (err) { next(err) }
}

export const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user })
}

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, city } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, city },
      { new: true, runValidators: true }
    ).select('-password')
    res.status(200).json({ success: true, user })
  } catch (err) { next(err) }
}

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password is incorrect' })
    user.password = newPassword
    await user.save()
    res.status(200).json({ success: true, message: 'Password changed successfully' })
  } catch (err) { next(err) }
}