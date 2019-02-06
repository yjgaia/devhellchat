let content;
global.Collections = DIV({
    style : {
        bixSizing : 'border-box',
        position : 'fixed',
        bottom : 40,
        right : 200,
        width : 320,
        height : 480,
        backgroundColor : '#FFF',
        color : 'initial',
        boxShadow : '0px 0px 16px -4px #646464',
        backgroundColor : '#FDFDFD',
        paddingTop : 30,
        // overflowY : 'auto',
        onDisplayResize : (width, height) => {
            if (width <= 800) {
                return {
                    right : 4,
                    width : 180,
                    height : 320
                }
            } else {
                return {
                    right : 200,
                    width : 320,
                    height : 480
                }
            }
        }
    },
    c : [A({
        style : {
            position: 'absolute',
            top : -7,
            left : 5,
            fontSize : 30,
            fontWeight : 'bold',
            color : '#646464'
        },
        c : [FontAwesome.GetIcon('times')],
        on : {
            tap : (event, el) => {
                el.getParent().hide();
            }
        }
    }), content = DIV({
        style : {
            overflowY : 'auto',
            marginTop : '20px',
            height : 'calc(100% - 20px)'
        }
    })],
    on : {
        bus : (event, el) => {
            // console.log(event, el.getEl());
            // console.log(global.bus, global.bus.target);

            const passenger = global.bus[global.bus.target.name][global.bus.target.index];
            function getIconName() {
                const map = {
                    'pictures' : 'image',
                    'files' : 'file',
                    'links' : 'link'
                }
                const result = map[global.bus.target.name];

                if (result === 'link') {
                    return passenger.fileName === 'Youtube' ? 'youtube' : 'link';
                } else {
                    return result || '';
                }
            }
            const icon = FontAwesome.GetIcon({
                style : {
                    marginRight : '.5em',
                    color : getIconName() === 'youtube' ? '#e03030' : undefined,
                    // backgroundColor : getIconName() === 'youtube' ? '#FFF' : undefined,
                    // padding : getIconName() === 'youtube' ? 2 : undefined,
                    // borderRadius : getIconName() === 'youtube' ? 4 : undefined
                    // fontWeight : ['youtube'].indexOf(getIconName()) > -1 ? '400' : '900'
                },
                key : getIconName()
            });

            // 임시 조치
            if (icon.getEl().classList.value === 'fa fa-youtube') {
                icon.getEl().classList.remove('fa');
                icon.getEl().classList.add('fab');
            }

            const passengerNode = A({
                style : {
                    display: 'block',
                    margin : '8px 0px',
                    backgroundColor : '#F4F4F4',
                    color : '#646464',
                    padding : '.5em',
                },
                href : passenger.downloadURL,
                target : '_blank',
                c : [DIV({
                    c : [icon,
                    SPAN({
                        style : {
                            // textDecoration : 'underline'
                        },
                        c : passenger.fileName
                    })]
                }), DIV({
                    style : {
                        display : 'inline-block',
                        width : '100%',
                    },
                    c : [IMG({
                        style : {
                            marginRight : 5,
                            backgroundColor : '#fff',
                            onDisplayResize : (width, height) => {
                                // 모바일
                                if (width <= 1280) {
                                    return {
                                        marginBottom : -4,
                                        width : 18,
                                        height : 18,
                                        borderRadius : 4
                                    };
                                } else {
                                    return {
                                        marginBottom : -5,
                                        width : 20,
                                        height : 20,
                                        borderRadius : 5
                                    };
                                }
                            }
                        },
                        src : LoadIcon.getUserIconURL(passenger.userId) === undefined ? passenger.userIconURL : LoadIcon.getUserIconURL(passenger.userId)
                    }), passenger.name]
                })]
            });

            passengerNode.prependTo(content);
        }
    },
});