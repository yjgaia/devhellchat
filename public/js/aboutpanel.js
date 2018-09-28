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
				src : '/resource/icon.png'
			}), P({
				style : {
					marginTop : 20
				},
				c : 'devhellchat(개발자지옥챗)은 비주류 게임 엔진들을 다루는 채팅 커뮤니티임(읔니티, 언뤼얼 노노)\n개발하다 스트레스 받으면 놀러와서 풀고가도댐'
			}), P({
				style : {
					fontWeight : 'bold',
					textDecoration : 'underline'
				},
				c : '단, 여기서 싸우거나 다른 사람한테 시비걸거나 비꼬거나 하면 즉각 처단함.\n이상한 놈이 있으면 싸우지말고 그냥 무시하셈'
			}), DIV({
				style : {
					marginTop : 20,
					maxWidth : 200
				},
				c : [H2({
					c : '활동 별 경험치 테이블'
				}), TABLE({
					style : {
						marginTop : 10,
						border : '1px solid #666'
					},
					c : [TR({
						c : [TH({
							style : {
								padding : 5,
								border : '1px solid #666'
							},
							c : '활동'
						}), TH({
							style : {
								padding : 5,
								border : '1px solid #666'
							},
							c : '경험치'
						})]
					}), TR({
						c : [TD({
							style : {
								padding : 5,
								border : '1px solid #666'
							},
							c : '채팅'
						}), TD({
							style : {
								padding : 5,
								border : '1px solid #666'
							},
							c : '10'
						})]
					}), TR({
						c : [TD({
							style : {
								padding : 5,
								border : '1px solid #666'
							},
							c : '유게짱'
						}), TD({
							style : {
								padding : 5,
								border : '1px solid #666'
							},
							c : '100'
						})]
					})]
				})]
			}), DIV({
				style : {
					marginTop : 20
				},
				c : A({
					style : {
						color : '#4183c4',
						textDecoration : 'underline'
					},
					target : '_blank',
					href : 'https://github.com/Hanul/devhellchat',
					c : 'devhellchat 소스코드'
				})
			})]
		}));
	}
});