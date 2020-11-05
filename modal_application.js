{
	"type": "modal",
	"title": {
		"type": "plain_text",
		"text": "入構申告",
		"emoji": true
	},
	"submit": {
		"type": "plain_text",
		"text": "Submit",
		"emoji": true
	},
	"close": {
		"type": "plain_text",
		"text": "Cancel",
		"emoji": true
	},
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "入構した日付・時間帯・理由を記入してください"
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "plain_text",
				"text": "This is a plain text section block.",
				"emoji": true
			}
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "timepicker",
					"initial_time": "13:37",
					"placeholder": {
						"type": "plain_text",
						"text": "Select time",
						"emoji": true
					},
					"action_id": "actionId-0"
				},
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "Click Me",
						"emoji": true
					},
					"value": "click_me_123",
					"action_id": "actionId-1"
				}
			]
		},
		{
			"dispatch_action": true,
			"type": "input",
			"element": {
				"type": "plain_text_input",
				"dispatch_action_config": {
					"trigger_actions_on": [
						"on_character_entered"
					]
				},
				"action_id": "plain_text_input-action"
			},
			"label": {
				"type": "plain_text",
				"text": "入構理由",
				"emoji": true
			}
		},
		{
			"type": "input",
			"element": {
				"type": "static_select",
				"placeholder": {
					"type": "plain_text",
					"text": "Select an item",
					"emoji": true
				},
				"options": [
					{
						"text": {
							"type": "plain_text",
							"text": "研究のため",
							"emoji": true
						},
						"value": "value-0"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "論文投稿のため",
							"emoji": true
						},
						"value": "value-1"
					},
					{
						"text": {
							"type": "plain_text",
							"text": "*this is plain_text text*",
							"emoji": true
						},
						"value": "value-2"
					}
				],
				"action_id": "static_select-action"
			},
			"label": {
				"type": "plain_text",
				"text": "入構理由",
				"emoji": true
			}
		}
	]
}
