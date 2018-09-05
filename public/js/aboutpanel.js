global.AboutPanel = CLASS({
	
	preset : () => {
		return DIV;
	},
	
	init : (inner, self, user) => {
		
		self.append(DIV({
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