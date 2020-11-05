const axios = require("axios");
const qs = require("qs");

const JsonDB = require("node-json-db");
const db = new JsonDB("notes", true, false);

const apiUrl = "https://slack.com/api";

const tp = require("./timepicker");

//db.delete("/");

/*
 * Home View - Use Block Kit Builder to compose: https://api.slack.com/tools/block-kit-builder
 */

const updateView = async user => {
  // Intro message -

  let blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
      text: "*README*\n\n *入構申告アプリβ版* :alpaca:\n β版です．動作保証はないので，記入した場合は *必ず* <https://docs.google.com/spreadsheets/d/1CKTZmSHKiYEYOBHJx_LO9K-2eJQWBgF1kGxeTkBEGaY/edit?usp=sharing|*この記入先*>で確認してください!!\n\n *使い方*\n 1. 右にある `Declare admittance` をクリック\n 2. 項目に全て記入\n  (入構理由として記入されるのは `入構理由` のほうだけですが， `入構理由_sub` のほうも記入をお願いします．今後こちらに移行予定です．)\n 3. `Submit` をクリック\n\n 登録されたデータが間違えていた場合(電話番号など)は<https://docs.google.com/spreadsheets/d/11IJl5xDsg-4KgzjVdTXXDc0iSBkCJDOWPDg4VzHpyBY/edit?usp=sharing|ここ>で各自変更をお願いします．\nまた，日付を `今日` にすると *UTC+0* が参照され，日付が前日になるバグが確認されています．気をつけてください．\n ```朝8:00に記入 -> -9:00され前日(23:00)に```\n\n *推奨環境*\n - PC\n - ios\n Androidは未対応です．"
      },
      accessory: {
        type: "button",
        action_id: "add_note",
        text: {
          type: "plain_text",
          text: "Declare admittance",
          emoji: true
        }
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text:
            ":alpaca: Hey, my source code is on <https://glitch.com/edit/#!/admission-manage-app|glitch>!"
        }
      ]
    },
    {
      type: "divider"
    }
  ];

  // Append new data blocks after the intro -

  let newData = [];

  try {
    const rawData = db.getData(`/${user}/data/`);

    newData = rawData.slice().reverse(); // Reverse to make the latest first
    newData = newData.slice(0, 50); // Just display 20. BlockKit display has some limit.
  } catch (error) {
    // console.error(error);
  }

  if (newData) {
    let noteBlocks = [];

    for (const o of newData) {
      //const color = o.color ? o.color : "yellow";

      let note = o.reason;
      //if (note.length > 3000) {
      //  note = note.substr(0, 2980) + "... _(truncated)_";
      //  console.log(note.length);
      //}

      noteBlocks = [
        {
          type: "section",
          text: {
            type: "plain_text_input",
            text: note
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: o.start_date
            }
          ]
        },
        {
          type: "divider"
        }
      ];
      blocks = blocks.concat(noteBlocks);
    }
  }

  // The final view -

  let view = {
    type: "home",
    title: {
      type: "plain_text",
      text: "Keep notes!"
    },
    blocks: blocks
  };

  return JSON.stringify(view);
};

/* Display App Home */
const displayHome = async (user, data) => {
  if (data) {
    //----------------------------------------
    // Store in a local DB
    db.push(`/${user}/data[]`, data, true);
    //------------------------------------------
  }

  const args = {
    token: process.env.SLACK_BOT_TOKEN,
    user_id: user,
    view: await updateView(user)
  };

  const result = await axios.post(
    `${apiUrl}/views.publish`,
    qs.stringify(args)
  );

  try {
    if (result.data.error) {
      console.log(result.data.error);
    }
  } catch (e) {
    console.log(e);
  }
};

/* Open a modal */
const openModal = async trigger_id => {
  // これで現在時刻を取得する
  let date = new Date();
  let todayStr =
    String(date.getFullYear()) +
    "-" +
    String(date.getMonth() + 1) +
    "-" +
    String(date.getDate());
  
  
  let blocks = [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: "入構した日付・時間帯・理由を記入してください"
			}
		},
		{
			type: "divider"
		}
  ];
  
  const datepickerStart = [
    {
      type: "section",
      block_id: "startDate",
      text: {
        type: "mrkdwn",
        text: "開始日時"
      },
      accessory: {
        type: "datepicker",
        initial_date: todayStr,
        placeholder: {
          type: "plain_text",
          text: "Select a date",
          emoji: true
        },
        action_id: "start_date_action"
      }
    }
  ];
  
  const datepickerEnd = [
    {
      type: "section",
      block_id: "endDate",
      text: {
        type: "mrkdwn",
        text: "終了日時"
      },
      accessory: {
        type: "datepicker",
        initial_date: todayStr,
        placeholder: {
          type: "plain_text",
          text: "Select a date",
          emoji: true
        },
        action_id: "end_date_action"
      }
    }
  ];
  
  const admittanceReason = [
		{
			dispatch_action: true,
			type: "input",
      block_id: "reason",
			element: {
				type: "plain_text_input",
				dispatch_action_config: {
					trigger_actions_on: [
						"on_character_entered"
					]
				},
				action_id: "plain_text_input_action"
			},
			label: {
				type: "plain_text",
				text: "入構理由",
				emoji: true
			}
		},
		{
			type: "input",
      block_id: "reason_choices",
			element: {
				type: "static_select",
				placeholder: {
					type: "plain_text",
					text: "Select an item",
					emoji: true
				},
				options: [
					{
						text: {
							type: "plain_text",
							text: "研究のため",
							emoji: true
						},
						value: "value-0"
					},
					{
						text: {
							type: "plain_text",
							text: "論文作成のため",
							emoji: true
						},
						value: "value-1"
					},
				],
				action_id: "static_select_action"
			},
			label: {
				type: "plain_text",
				text: "入構理由_sub",
				emoji: true
			}
		}    
  ]
  
  const timepickerStart = tp.genTimepicker("start");
  const timepickerEnd = tp.genTimepicker("end");
  
  blocks = blocks.concat(datepickerStart);
  blocks = blocks.concat(timepickerStart);
  blocks = blocks.concat(datepickerEnd);
  blocks = blocks.concat(timepickerEnd);
  blocks = blocks.concat(admittanceReason);
  
  const modal = {
    type: "modal",
    title: {
      type: "plain_text",
      text: "入構申告",
      emoji: true
    },
    submit: {
      type: "plain_text",
      text: "Submit",
      emoji: true
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true
    },
    blocks: blocks
  };

  const args = {
    token: process.env.SLACK_BOT_TOKEN,
    trigger_id: trigger_id,
    view: JSON.stringify(modal)
  };

  const result = await axios.post(`${apiUrl}/views.open`, qs.stringify(args));

  //console.log(result.data);
};

module.exports = { displayHome, openModal };
