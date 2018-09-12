global.ContextMenu = CLASS((cls) => {
	
	let openedMenu;
	let tapEvent;
	
	let getItemStyle = cls.getItemStyle = () => {
		return {
			width : 100,
			padding : 7,
			borderBottom : '1px solid #666'
		};
	};
	
	return {
		
		preset : () => {
			return UL;
		},
		
		params : () => {
			return {
				style : {
					position : 'absolute',
					zIndex : 999999,
					backgroundColor : '#333',
					border : '1px solid #666',
					borderBottom : 'none',
					textAlign : 'center',
					cursor : 'pointer'
				}
			};
		},
		
		init : (inner, self) => {
			
			if (openedMenu !== undefined) {
				openedMenu.remove();
			}
			
			openedMenu = self;
			
			if (tapEvent === undefined) {
				
				tapEvent = EVENT('tap', () => {
					if (openedMenu !== undefined) {
						openedMenu.remove();
						openedMenu = undefined;
					}
				});
			}
			
			self.appendTo(BODY);
		},
		
		afterInit : (inner, self) => {
			
			if (self.getWidth() + self.getStyle('left') > WIN_WIDTH()) {
				self.addStyle({
					left : WIN_WIDTH() - self.getWidth()
				});
			}
			
			if (self.getHeight() + self.getStyle('top') > WIN_HEIGHT()) {
				self.addStyle({
					top : WIN_HEIGHT() - self.getHeight()
				});
			}
		}
	};
});
