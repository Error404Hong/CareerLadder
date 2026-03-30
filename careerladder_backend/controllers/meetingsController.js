const Meetings = require("../models/meetings");
const sendResponse = require("../utils/responseHelper");
const logger = require("../utils/logger");
const { StreamClient } = require("@stream-io/node-sdk");
const { clerkClient } = require("@clerk/express");

const streamClient = new StreamClient(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET,
);

const scheduleMeeting = async (req, res) => {
    const {
        application_id,
        company_id,
        applicant_id,
        title,
        description,
        meeting_type,
        reference_type,
        reference_id,
        scheduled_at,
        duration,
    } = req.body;

    if (!company_id) return sendResponse(res, 400, "Company ID is required");
    if (!applicant_id)
        return sendResponse(res, 400, "Applicant ID is required");
    if (!scheduled_at)
        return sendResponse(res, 400, "Scheduled date is required");
    if (!meeting_type)
        return sendResponse(res, 400, "Meeting type is required");

    try {
        // upsert both users in Stream before creating call
        await streamClient.upsertUsers([
            { id: company_id, role: "user" },
            { id: applicant_id, role: "user" },
        ]);

        const roomName = `careerladder-${application_id ?? reference_id}-${Date.now()}`;

        const call = streamClient.video.call("default", roomName);
        await call.create({
            data: {
                created_by_id: company_id,
                members: [
                    { user_id: company_id, role: "host" },
                    { user_id: applicant_id, role: "user" },
                ],
                custom: {
                    title: title ?? "Interview",
                    description: description ?? "",
                    scheduled_at,
                },
            },
        });

        const meeting_url = `${process.env.FRONTEND_URL}/room/${roomName}`;

        const meeting = await Meetings.scheduleMeeting(
            application_id ?? null,
            company_id,
            applicant_id,
            meeting_url,
            roomName,
            title ?? "Interview",
            description ?? null,
            meeting_type,
            reference_type ?? null,
            reference_id ?? null,
            scheduled_at,
            duration || 60,
        );

        if (!meeting)
            return sendResponse(res, 400, "Failed to schedule meeting");
        return sendResponse(
            res,
            200,
            "Meeting scheduled successfully",
            meeting,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to schedule meeting: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to schedule meeting", {
            error: error.message,
        });
    }
};

const getMeetingByApplication = async (req, res) => {
    const { applicationId } = req.params;
    if (!applicationId)
        return sendResponse(res, 400, "Application ID is required");

    try {
        const meeting = await Meetings.getMeetingByApplication(applicationId);
        return sendResponse(res, 200, "Meeting fetched successfully", meeting);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to get meeting: ", error.message);
        return sendResponse(res, 500, "Failed to get meeting", {
            error: error.message,
        });
    }
};

const getMeetingsByCompany = async (req, res) => {
    const { companyId } = req.params;
    if (!companyId) return sendResponse(res, 400, "Company ID is required");

    try {
        const meetings = await Meetings.getMeetingsByCompany(companyId);

        const enriched = await Promise.all(
            meetings.map(async (meeting) => {
                try {
                    const clerkUser = await streamClient.upsertUsers([
                        { id: meeting.applicant_id },
                    ]);
                    const user = await clerkClient.users.getUser(
                        meeting.applicant_id,
                    );

                    return {
                        ...meeting,
                        applicant_name: `${user.firstName} ${user.lastName}`,
                        applicant_email:
                            user.emailAddresses[0]?.emailAddress ?? "",
                        applicant_image: user.imageUrl,
                    };
                } catch {
                    return {
                        ...meeting,
                        applicant_name: null,
                        applicant_email: null,
                        applicant_image: null,
                    };
                }
            }),
        );

        return sendResponse(res, 200, "Meetings fetched", enriched);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to get meetings: ", error.message);
        return sendResponse(res, 500, "Failed to get meetings", {
            error: error.message,
        });
    }
};

const getMeetingsByApplicant = async (req, res) => {
    const { applicantId } = req.params;
    if (!applicantId) return sendResponse(res, 400, "Applicant ID is required");

    try {
        const meetings = await Meetings.getMeetingsByApplicant(applicantId);

        const enriched = await Promise.all(
            meetings.map(async (meeting) => {
                try {
                    const user = await clerkClient.users.getUser(
                        meeting.company_id,
                    );

                    return {
                        ...meeting,
                        company_logo_url: user.imageUrl,
                        company_email:
                            user.emailAddresses[0]?.emailAddress ?? "",
                    };
                } catch {
                    return {
                        ...meeting,
                        company_logo_url: null,
                        company_email: null,
                    };
                }
            }),
        );
        return sendResponse(
            res,
            200,
            "Meetings fetched successfully",
            enriched,
        );
    } catch (error) {
        logger.error("[CONTROLLER] Failed to get meetings: ", error.message);
        return sendResponse(res, 500, "Failed to get meetings", {
            error: error.message,
        });
    }
};

const updateMeetingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!id) return sendResponse(res, 400, "Meeting ID is required");
    if (!status) return sendResponse(res, 400, "Status is required");

    try {
        const meeting = await Meetings.updateMeetingStatus(id, status);
        if (!meeting)
            return sendResponse(res, 400, "Failed to update meeting status");
        return sendResponse(
            res,
            200,
            "Meeting status updated successfully",
            meeting,
        );
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to update meeting status: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to update meeting status", {
            error: error.message,
        });
    }
};

const rescheduleMeeting = async (req, res) => {
    const { id } = req.params;
    const {
        company_id,
        applicant_id,
        title,
        description,
        scheduled_at,
        duration,
    } = req.body;

    if (!id) return sendResponse(res, 400, "Meeting ID is required");
    if (!scheduled_at)
        return sendResponse(res, 400, "Scheduled date is required");

    try {
        await streamClient.upsertUsers([
            { id: company_id, role: "user" },
            { id: applicant_id, role: "user" },
        ]);

        const roomName = `cl-rs-${id.replace(/-/g, "")}-${Date.now()}`;
        const call = streamClient.video.call("default", roomName);
        await call.create({
            data: {
                created_by_id: company_id,
                members: [
                    { user_id: company_id, role: "host" },
                    { user_id: applicant_id, role: "user" },
                ],
                custom: {
                    title: title ?? "Interview",
                    description: description ?? "",
                    scheduled_at,
                },
            },
        });

        const meeting_url = `${process.env.FRONTEND_URL}/room/${roomName}`;

        const meeting = await Meetings.rescheduleMeeting(
            id,
            title ?? "Interview",
            description ?? null,
            meeting_url,
            roomName,
            scheduled_at,
            duration || 60,
        );

        if (!meeting)
            return sendResponse(res, 400, "Failed to reschedule meeting");
        return sendResponse(
            res,
            200,
            "Meeting rescheduled successfully",
            meeting,
        );
    } catch (error) {
        console.log(
            "[CONTROLLER] Failed to reschedule meeting: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to reschedule meeting", {
            error: error.message,
        });
    }
};

const deleteMeeting = async (req, res) => {
    const { id } = req.params;
    if (!id) return sendResponse(res, 400, "Meeting ID is required");

    try {
        const meeting = await Meetings.deleteMeeting(id);
        if (!meeting) return sendResponse(res, 400, "Failed to delete meeting");
        return sendResponse(res, 200, "Meeting deleted successfully", meeting);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to delete meeting: ", error.message);
        return sendResponse(res, 500, "Failed to delete meeting", {
            error: error.message,
        });
    }
};

// generate stream token for frontend
const getStreamToken = async (req, res) => {
    const { userId } = req.params;
    if (!userId) return sendResponse(res, 400, "User ID is required");

    try {
        const token = streamClient.generateUserToken({ user_id: userId });
        return sendResponse(res, 200, "Token generated successfully", {
            token,
        });
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to generate stream token: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to generate token", {
            error: error.message,
        });
    }
};

const getMeetingByRoomName = async (req, res) => {
    const { roomName } = req.params;
    if (!roomName) return sendResponse(res, 400, "Room name is required");

    try {
        const meeting = await Meetings.getMeetingByRoomName(roomName);
        return sendResponse(res, 200, "Meeting fetched successfully", meeting);
    } catch (error) {
        logger.error(
            "[CONTROLLER] Failed to get meeting by room name: ",
            error.message,
        );
        return sendResponse(res, 500, "Failed to get meeting", {
            error: error.message,
        });
    }
};

const getApplicantMeetingById = async (req, res) => {
    const { referenceid, referencetype, applicantid } = req.params;

    if (!referenceid) return sendResponse(res, 400, "Reference Id is required");
    if (!referencetype)
        return sendResponse(res, 400, "Reference type is required");
    if (!applicantid) return sendResponse(res, 400, "Applicant id is required");

    try {
        const result = await Meetings.getApplicantMeetingById(
            referenceid,
            referencetype,
            applicantid,
        );
        return sendResponse(res, 200, "Applicant meetings fetched", result);
    } catch (error) {
        logger.error("[CONTROLLER] Failed to get applicant meeting by id");
        return sendResponse(res, 500, "Failed to get applicant meeting by id", {
            error: error.message,
        });
    }
};

module.exports = {
    scheduleMeeting,
    rescheduleMeeting,
    getMeetingByApplication,
    getMeetingsByCompany,
    getMeetingsByApplicant,
    updateMeetingStatus,
    deleteMeeting,
    getStreamToken,
    getMeetingByRoomName,
    getApplicantMeetingById,
};
