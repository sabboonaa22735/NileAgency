const Notification = require('../models/Notification');

const createNotification = async ({ userId, type, title, message, link }) => {
  try {
    const notification = new Notification({ userId, type, title, message, link });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const notifyJobMatchingUsers = async (job) => {
  try {
    const EmployeeProfile = require('../models/EmployeeProfile');
    
    const userSkills = job.skills || [];
    const jobTitle = job.title.toLowerCase();
    
    const candidates = await EmployeeProfile.find({
      $or: [
        { skills: { $in: userSkills } },
        { skills: { $regex: jobTitle.split(' ')[0], $options: 'i' } }
      ]
    }).populate('userId');

    for (const profile of candidates) {
      if (profile.userId && profile.userId._id) {
        await createNotification({
          userId: profile.userId._id,
          type: 'job',
          title: `New job matching your profile: ${job.title}`,
          message: `A new ${job.jobType} position at ${job.recruiterId?.companyName || 'a company'} that matches your skills.`,
          link: `/jobs/${job._id}`
        });
      }
    }
  } catch (error) {
    console.error('Error notifying job matching users:', error);
  }
};

const notifyApplicationStatusChange = async (application, newStatus) => {
  try {
    const User = require('../models/User');
    
    const applicationData = await Application.findById(application._id)
      .populate('jobId')
      .populate({
        path: 'employeeId',
        populate: { path: 'userId' }
      });

    if (applicationData?.employeeId?.userId) {
      const statusMessages = {
        accepted: `Your application for ${applicationData.jobId?.title} has been accepted!`,
        rejected: `Your application for ${applicationData.jobId?.title} has been reviewed.`,
        interview: `You have been invited for an interview for ${applicationData.jobId?.title}!`,
        pending: `Your application for ${applicationData.jobId?.title} is being reviewed.`
      };

      await createNotification({
        userId: applicationData.employeeId.userId._id,
        type: 'application',
        title: `Application ${newStatus}`,
        message: statusMessages[newStatus] || `Your application status has been updated to ${newStatus}.`,
        link: `/dashboard?tab=applications`
      });
    }
  } catch (error) {
    console.error('Error notifying application status change:', error);
  }
};

const notifyNewMessage = async (recipientId, senderName, jobTitle) => {
  try {
    await createNotification({
      userId: recipientId,
      type: 'message',
      title: `New message from ${senderName}`,
      message: `You have a new message regarding ${jobTitle}`,
      link: `/chat`
    });
  } catch (error) {
    console.error('Error notifying new message:', error);
  }
};

module.exports = {
  createNotification,
  notifyJobMatchingUsers,
  notifyApplicationStatusChange,
  notifyNewMessage
};