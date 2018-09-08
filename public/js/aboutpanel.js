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
			}), IMG({
				style : {
					marginTop : 20
				},
				src : 'resource/icon.png'
			}), P({
				style : {
					marginTop : 20
				},
				c : 'devhellchat(개발자지옥챗)은 비주류 게임 엔진들을 다루는 채팅 커뮤니티임(읔니티, 언뤼얼 노노)\n개발하다 스트레스 받으면 놀러와서 풀고가도댐'
			})]
		}));
	}
});