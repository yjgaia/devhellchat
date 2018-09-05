global.AboutPanel = CLASS({
	
	preset : () => {
		return DIV;
	},
	
	init : (inner, self, user) => {
		
		// 뒤로가기
		self.append(UUI.BUTTON_H({
			style : {
				position : 'absolute',
				left : 10,
				top : 10
			},
			icon : FontAwesome.GetIcon({
				style : {
					fontSize : 20
				},
				key : 'arrow-left'
			}),
			spacing : 10,
			title : SPAN({
				style : {
					fontSize : 14
				},
				c : '채팅으로'
			}),
			on : {
				tap : () => {
					GO('');
				}
			}
		}));
		
		self.append(DIV({
			style : {
				padding : '60px 40px'
			},
			c : [H1({
				style : {
					fontSize : 25,
					fontWeight : 'bold'
				},
				c : 'devhellchat 소개'
			}), P({
				style : {
					marginTop : 10
				},
				c : 'devhellchat은 비주류 게임 엔진(읔니티, 언뤼얼 노노)들을 다루는 채팅 커뮤니티임\n개발하다 스트레스 받으면 놀러와서 풀고가삼'
			})]
		}));
	}
});