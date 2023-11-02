export const meetingTemplate = {
  topic: "", // to be filled in by caller
  agenda: "", // to be filled in by caller
  start_time: "", // to be filled in by caller
  password: "", // to be filled in by caller
  default_password: false,
  duration: 60, // (todo very important) NEED TO BE BUSINESS PLAN to get over 40 minutes
  timezone: "America/Los_Angeles", // to be filled in by caller default to PST
  settings: {
    contact_email: "", // to be filled in by caller
    contact_name: "", // to be filled in by caller
    allow_multiple_devices: true,
    // alternative_hosts: "aaronaung.95@gmail.com", this user needs to be licensed
    // alternative_hosts_email_notification: true,
    approval_type: 2, // no registration required.
    auto_recording: "cloud",
    encryption_type: "enhanced_encryption",
    focus_mode: true,
    host_video: true,
    join_before_host: false,
    language_interpretation: {
      // ignored: only available for Business plan
      enable: true,
      interpreters: [
        {
          email: "interpreter@example.com",
          languages: "US,FR",
        },
      ],
    },
    sign_language_interpretation: {
      // ignored: only available for Business plan
      enable: true,
      interpreters: [
        {
          email: "interpreter@example.com",
          sign_language: "American",
        },
      ],
    },
    meeting_authentication: false,
    mute_upon_entry: true,
    participant_video: true,
    private_meeting: false,
    waiting_room: true,
    host_save_video_order: true,
    alternative_host_update_polls: true,
    continuous_meeting_chat: {
      enable: true,
      auto_add_invited_external_users: true,
    },
  },

  type: 2,
};
