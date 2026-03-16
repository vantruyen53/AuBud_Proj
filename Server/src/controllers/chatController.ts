import { chatService } from '../services/chatService/chatSerivce.js';

export const chatController = async (req: any, res: any) => {
  try {
    const { message, context, wallets } = req.body;
    const userId = req.user.id;

    console.log('Mess to server: ', message)

    const result = await chatService({ userId, message, context, wallets });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Đã có lỗi xảy ra, vui lòng thử lại' });
  }
};