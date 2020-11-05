let genTimepicker = id => {
  
  let hours = [];
  let minutes = [];
  for (let hour = 0; hour <= 23; hour++) {
    const timeStr = ("00" + hour).slice(-2);
    const choice = [
      {
        text: {
          type: "plain_text",
          text: timeStr,
          emoji: true
        },
        value: timeStr
      }
    ];
    hours = hours.concat(choice);
  }

  for (let minute = 0; minute <= 45; minute += 15) {
    const timeStr = ("00" + minute).slice(-2);
    const choice = [
      {
        text: {
          type: "plain_text",
          text: timeStr,
          emoji: true
        },
        value: timeStr
      }
    ];
    minutes = minutes.concat(choice);
  }


  let section2 = [
    {
      type: "actions",
      block_id: id + "_time",
      // block_id: "id",
      elements: [
        {
          type: "static_select",
          placeholder: {
            type: "plain_text",
            text: "Select an hour",
            emoji: true
          },
          action_id: id + "_hour_action",
          options: hours
        },
        {
          type: "static_select",
          placeholder: {
            type: "plain_text",
            text: "Select a minute",
            emoji: true
          },
          action_id: id + "_minute_action",
          options: minutes
        }
      ]
    }
  ];

  
  return section2;
};

module.exports = { genTimepicker };
