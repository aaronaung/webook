import { startOfDay, addHours } from "date-fns";

export const db = [
  {
    handle: "offstage",
    title: "Offstage Dance Studio",
    description:
      "Dance studio in the heart of Orange County. We offer classes for all ages and skill levels.",
    serviceGroups: [
      {
        title: "Classes",
        services: [
          {
            title: "Beginner Iso",
            providers: [
              {
                name: "Aaron Didi",
                avatarUrl: "",
              },
            ],
            from: addHours(startOfDay(new Date()), 18).getUTCMilliseconds(),
            to: addHours(startOfDay(new Date()), 19.5).getUTCMilliseconds(),
            price: 10000,
            maxOccupancy: 100,
          },
          {
            title: "Popping",
            providers: [
              {
                name: "Dinoi",
                avatarUrl: "",
              },
            ],
            from: addHours(startOfDay(new Date()), 19.5).getUTCMilliseconds(),
            to: addHours(startOfDay(new Date()), 21).getUTCMilliseconds(),
            price: 10000,
            maxOccupancy: 100,
          },
          {
            title: "Intermediate/Advanced",
            providers: [
              {
                name: "Ethan Estandian",
                avatarUrl: "",
              },
            ],
            from: addHours(startOfDay(new Date()), 19.5).getUTCMilliseconds(),
            to: addHours(startOfDay(new Date()), 21).getUTCMilliseconds(),
            price: 10000,
            maxOccupancy: 100,
          },
          {
            title: "Contemporary Fusion",
            providers: [
              {
                name: "Claire Ku",
                avatarUrl: "",
              },
            ],
            from: addHours(startOfDay(new Date()), 21).getUTCMilliseconds(),
            to: addHours(startOfDay(new Date()), 22.5).getUTCMilliseconds(),
            price: 10000,
            maxOccupancy: 100,
          },
          {
            title: "K-pop (BTS - Dynamite)",
            providers: [
              {
                name: "Miriya Lee",
                avatarUrl: "",
              },
            ],
            from: addHours(startOfDay(new Date()), 21).getUTCMilliseconds(),
            to: addHours(startOfDay(new Date()), 22.5).getUTCMilliseconds(),
            price: 10000,
            maxOccupancy: 100,
          },
        ],
      },
      {
        title: "Studio rental",
        services: [
          {
            title: "Small room hourly rental (1-5 people)",
            price: 40000,
          },
          {
            title: "Big room hourly rental (5-20 people)",
            price: 65000,
          },
          {
            title: "Big room hourly rental (20+ people)",
            price: 110000,
          },
          {
            title: "Talk to us - for custom booking",
          },
        ],
      },
    ],
  },
];
