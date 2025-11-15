import profileService from '../services/profile.service.js';

const createProfile = async (req, res, next) => {
	try {
		const created = await profileService.createProfile(req.body);
		res.status(201).json({ message: 'Tạo hồ sơ thành công', data: created });
	} catch (err) {
		next(err);
	}
};

const listProfiles = async (req, res, next) => {
	try {
		const { q, page = 1, limit = 20 } = req.query;
		const result = await profileService.listProfiles({ q, page, limit });
		res.json(result);
	} catch (err) {
		next(err);
	}
};

const getProfile = async (req, res, next) => {
	try {
		const profile = await profileService.getProfileById(req.params.id);
		res.json(profile);
	} catch (err) {
		next(err);
	}
};

const updateProfile = async (req, res, next) => {
	try {
		const updated = await profileService.updateProfile(req.params.id, req.body);
		res.json({ message: 'Cập nhật hồ sơ thành công', data: updated });
	} catch (err) {
		next(err);
	}
};

const deleteProfile = async (req, res, next) => {
	try {
		await profileService.deleteProfile(req.params.id);
		res.json({ message: 'Xóa hồ sơ thành công' });
	} catch (err) {
		next(err);
	}
};

export {
	createProfile,
	listProfiles,
	getProfile,
	updateProfile,
	deleteProfile
};


