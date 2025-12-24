/* ================================
   GET FRIEND REQUESTS (PENDING)
================================ */
export const getFriendRequests = async (req, res) => {
  try {
    const currentUserId = req.id;

    const requests = await Friend.find({
      recipient: currentUserId,
      status: "pending"
    })
      .populate("requester", "fullname email profile")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
      message: "Danh sách lời mời kết bạn"
    });
  } catch (error) {
    console.error("Error getFriendRequests:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể tải lời mời kết bạn"
    });
  }
};

/* ================================
   REJECT FRIEND REQUEST
================================ */
export const rejectFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.id;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({
        success: false,
        message: "Friend ID is required"
      });
    }

    const friendship = await Friend.findOneAndDelete({
      requester: friendId,
      recipient: currentUserId,
      status: "pending"
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Đã từ chối lời mời kết bạn"
    });
  } catch (error) {
    console.error("Error rejectFriendRequest:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể từ chối lời mời"
    });
  }
};

/* ================================
   GET FRIEND LIST
================================ */
export const getFriendList = async (req, res) => {
  try {
    const currentUserId = req.id;

    const friendships = await Friend.find({
      status: "accepted",
      $or: [
        { requester: currentUserId },
        { recipient: currentUserId }
      ]
    })
      .populate("requester", "fullname email profile")
      .populate("recipient", "fullname email profile")
      .sort({ updatedAt: -1 });

    const friends = friendships.map(f => {
      const friend =
        f.requester._id.toString() === currentUserId
          ? f.recipient
          : f.requester;

      return {
        _id: friend._id,
        fullname: friend.fullname,
        email: friend.email,
        profile: friend.profile
      };
    });

    return res.status(200).json({
      success: true,
      count: friends.length,
      friends,
      message: "Danh sách bạn bè"
    });
  } catch (error) {
    console.error("Error getFriendList:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể tải danh sách bạn bè"
    });
  }
};

/* ================================
   CHECK FRIEND STATUS
================================ */
export const checkFriendStatus = async (req, res) => {
  try {
    const currentUserId = req.id;
    const { userId } = req.params;

    const friendship = await Friend.findOne({
      $or: [
        { requester: currentUserId, recipient: userId },
        { requester: userId, recipient: currentUserId }
      ]
    });

    if (!friendship) {
      return res.status(200).json({
        success: true,
        status: "none"
      });
    }

    return res.status(200).json({
      success: true,
      status: friendship.status,
      isRequester: friendship.requester.toString() === currentUserId
    });
  } catch (error) {
    console.error("Error checkFriendStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể kiểm tra trạng thái bạn bè"
    });
  }
};

/* ================================
   COUNT FRIENDS
================================ */
export const countFriends = async (req, res) => {
  try {
    const userId = req.id;

    const count = await Friend.countDocuments({
      status: "accepted",
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    });

    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error("Error countFriends:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể đếm số bạn bè"
    });
  }
};

/* ================================
   FRIEND SUGGESTIONS
================================ */
export const suggestFriends = async (req, res) => {
  try {
    const currentUserId = req.id;

    const friendships = await Friend.find({
      $or: [
        { requester: currentUserId },
        { recipient: currentUserId }
      ]
    });

    const excludedIds = new Set([currentUserId]);

    friendships.forEach(f => {
      excludedIds.add(f.requester.toString());
      excludedIds.add(f.recipient.toString());
    });

    const suggestions = await User.find({
      _id: { $nin: Array.from(excludedIds) },
      role: "user"
    })
      .select("fullname email profile")
      .limit(10);

    return res.status(200).json({
      success: true,
      suggestions,
      message: "Gợi ý kết bạn"
    });
  } catch (error) {
    console.error("Error suggestFriends:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể gợi ý bạn bè"
    });
  }
};

/* ================================
   CLEANUP FRIENDSHIPS (HELPER)
================================ */
export const removeAllFriendshipsOfUser = async (userId) => {
  try {
    await Friend.deleteMany({
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    });
    console.log(`Removed all friendships of user ${userId}`);
  } catch (error) {
    console.error("Error removeAllFriendshipsOfUser:", error);
  }
};
