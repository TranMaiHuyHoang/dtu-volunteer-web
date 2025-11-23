// import Profile from '../models/profile.model.js';
import Profile from '../models/studentProfile.model.js';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/customError.js';

const buildSearchFilter = (q) => {
	if (!q) return {};
	const regex = { $regex: q, $options: 'i' };
	return {
		$or: [
			{ name: regex },
			{ email: regex },
			{ phone: regex },
			{ address: regex },
			{ notes: regex }
		]
	};
};

const createProfile = async (data) => {
	if (!data?.name || !data?.email) {
		throw new BadRequestError('Vui lòng nhập đầy đủ name và email');
	}
	// Demo: ngăn trùng email tối thiểu
	const existed = await Profile.findOne({ email: data.email.toLowerCase().trim() });
	if (existed) {
		throw new ConflictError('Email đã tồn tại');
	}
	const profile = await Profile.create(data);
	return profile;
};

const listProfiles = async ({ q, page = 1, limit = 20 }) => {
	const filter = buildSearchFilter(q);
	const skip = (Number(page) - 1) * Number(limit);
	const [items, total] = await Promise.all([
		Profile.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
		Profile.countDocuments(filter)
	]);
	return {
		items,
		page: Number(page),
		limit: Number(limit),
		total,
		pages: Math.ceil(total / Number(limit)) || 1
	};
};

const getProfileById = async (id) => {
	const profile = await Profile.findById(id);
	if (!profile) throw new NotFoundError('Không tìm thấy hồ sơ');
	return profile;
};

const updateProfile = async (id, data) => {
	const profile = await Profile.findById(id);
	if (!profile) throw new NotFoundError('Không tìm thấy hồ sơ');

	// Demo: nếu đổi email, kiểm tra trùng
	if (data?.email && data.email !== profile.email) {
		const duplicated = await Profile.findOne({ email: data.email.toLowerCase().trim(), _id: { $ne: id } });
		if (duplicated) throw new ConflictError('Email đã tồn tại');
	}
	Object.assign(profile, data);
	await profile.save();
	return profile;
};

const deleteProfile = async (id) => {
	const profile = await Profile.findById(id);
	if (!profile) throw new NotFoundError('Không tìm thấy hồ sơ');
	await profile.deleteOne();
	return { id };
};

export default {
	createProfile,
	listProfiles,
	getProfileById,
	updateProfile,
	deleteProfile
};


