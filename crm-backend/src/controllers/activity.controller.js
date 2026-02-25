const Activity = require('../models/Activity.model');

/**
 * @desc    Get activity logs
 * @route   GET /api/activities
 * @access  Private
 */
const getActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = { performedBy: req.user._id };
    if (req.user.role === 'admin') delete query.performedBy;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [activities, total] = await Promise.all([
      Activity.find(query)
        .populate('performedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Activity.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivities };