import { Friend } from "../models/friend_model.js";
import { User } from "../models/user_model.js";
import { createNotification } from "./notification_controller.js";

// Send friend request or accept
export const followUser = async (req, res) => {
  const { requesterId, recipientId } = req.body;

  if (!recipientId) {
    return res.status(400).json({
      message: "Recipient ID is required",
      success: false,
    });
  }

  if (requesterId === recipientId) {
    return res.status(400).json({
      message: "Cannot follow yourself",
      success: false,
    });
  }

  const existingFriendship = await Friend.findOne({
    $or: [
      { requester: requesterId, recipient: recipientId },
      { requester: recipientId, recipient: requesterId }
    ]
  });

  if (existingFriendship) {
    if (existingFriendship.status === 'accepted') {
      return res.status(400).json({
        message: "Already friends",
        success: false,
      });
    }

    if (existingFriendship.status === 'pending' && existingFriendship.requester.toString() === requesterId) {
      return res.status(400).json({
        message: "Friend request already sent",
        success: false,
      });
    }

    // If pending and recipient is accepting
    if (existingFriendship.status === 'pending' && existingFriendship.recipient.toString() === requesterId) {
      existingFriendship.status = 'accepted';
      await existingFriendship.save();

      // Create notification for requester
      const recipient = await User.findById(recipientId);
      await createNotification(requesterId, 'friend_accepted', {
        accepterName: recipient.fullname,
        relatedUser: recipientId,
        relatedFriend: existingFriendship._id
      });

      return res.status(200).json({
        message: "Friend request accepted",
        success: true,
        friendship: existingFriendship
      });
    }
  }

  // Create new friend request
  const newFriendship = await Friend.create({
    requester: requesterId,
    recipient: recipientId,
    status: 'pending'
  });

  // Create notification for recipient
  const requester = await User.findById(requesterId);
  await createNotification(recipientId, 'friend_request', {
    requesterName: requester.fullname,
    relatedUser: requesterId,
    relatedFriend: newFriendship._id
  });

  return res.status(201).json({
    message: "Friend request sent",
    success: true,
    friendship: newFriendship
  });
};

// Unfollow/Remove friend
export const unfollowUser = async (req, res) => {
  try {
    const userId = req.id;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({
        message: "Friend ID is required",
        success: false,
      });
    }

    const friendship = await Friend.findOneAndDelete({
      $or: [
        { requester: userId, recipient: friendId },
        { requester: friendId, recipient: userId }
      ]
    });

    if (!friendship) {
      return res.status(404).json({
        message: "Friendship not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Unfollowed successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to unfollow",
      success: false,
    });
  }
};

// Get all users (community)
export const getFriends = async (req, res) => {
  try {
    const currentUserId = req.id;
    console.log('Fetching friends for user:', currentUserId);

    // Lấy tất cả users trừ chính mình, chỉ lấy role 'user'
    const users = await User.find({
      _id: { $ne: currentUserId },
      role: 'user' // Chỉ lấy users, không lấy admin
    })
      .select('fullname email phoneNumber role profile')
      .sort({ createdAt: -1 });

    console.log(`Found ${users.length} users`);

    // Format response
    const friends = users.map(user => ({
      _id: user._id,
      fullname: user.fullname || 'User',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role || 'user',
      profile: {
        bio: user.profile?.bio || '',
        profilePhoto: user.profile?.profilePhoto || '',
        location: user.profile?.location || '',
        skills: user.profile?.skills || [],
        resume: user.profile?.resume || '',
        resumeOriginalName: user.profile?.resumeOriginalName || ''
      }
    }));

    return res.status(200).json({
      friends,
      count: friends.length,
      success: true,
      message: "Danh sách cộng đồng được tải thành công"
    });
  } catch (error) {
    console.error('Error in getFriends:', error);
    return res.status(500).json({
      message: error.message || "Không thể tải danh sách cộng đồng",
      success: false,
    });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  const { userId: requesterId, body: { friendId: recipientId } } = req;

  if (!recipientId) {
    return res.status(400).json({
      message: "Recipient ID is required",
      success: false,
    });
  }

  const friendship = await Friend.findOne({
    $or: [
      { requester: recipientId, recipient: requesterId, status: 'pending' },
      { requester: requesterId, recipient: recipientId, status: 'pending' }
    ]
  });

  if (!friendship) {
    return res.status(404).json({
      message: "Friend request not found",
      success: false,
    });
  }

  if (friendship.recipient.toString() !== requesterId) {
    return res.status(403).json({
      message: "You can only accept requests sent to you",
      success: false,
    });
  }

  friendship.status = 'accepted';
  await friendship.save();

  const accepter = await User.findById(requesterId);
  await createNotification(recipientId, 'friend_accepted', {
    accepterName: accepter.fullname,
    relatedUser: requesterId,
    relatedFriend: friendship._id
  });

  return res.status(200).json({
    message: "Friend request accepted",
    success: true,
    friendship
  });
