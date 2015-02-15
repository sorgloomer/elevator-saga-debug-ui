(function(self, $, riot) {
    if (!self.$hege) self.$hege = {};

    function setup(opt) {
        self.$hege.options = opt || {};

        var COL_COMPONENTS = 3;
        var RED = [255, 0, 0], GREEN = [0, 255, 0], BLUE = [0, 0, 255],
            CYAN = [0, 255, 255], WHITE = [255, 255, 255],
            BLACK = [0, 0, 0], YELLOW = [255, 255, 0];
        var COL_TMP = [0, 0, 0];
        self.$hege.GRADIENT = [[0, WHITE], [5, GREEN], [10, YELLOW], [15, RED], [20, BLACK]];

        function lerpCol(t, c1, c2, dst) {
            for (var i = 0; i < COL_COMPONENTS; i++)
                dst[i] = (c2[i] - c1[i]) * t + c1[i];
            return dst;
        }
        function colStr(col) {
            return 'rgb(' + Math.round(col[0]) + ',' + Math.round(col[1]) + ','
                + Math.round(col[2]) + ')';
        }
        function colGrad(t, grad, tmpDst) {
            var i, g1, g2;
            if (t < grad[0][0]) return grad[0][1];
            for (i = 1; i < grad.length; i++) {
                g2 = grad[i]; g1 = grad[i-1];
                if (g2[0] > t) {
                    return lerpCol((t - g1[0])/(g2[0] - g1[0]),
                        g1[1], g2[1], tmpDst);
                }
            }
            return grad[i-1][1];
        }
        function ageColStr(time) {
            return colStr(colGrad(time, self.$hege.GRADIENT, COL_TMP));
        }

        var INFO_TEMPLATE = '<span style="' +
            'position: absolute;' +
            'top: -20px;' +
            'left: -8px;' +
            'width: 26px;' +
            'text-align: center;' +
            '"><span style="' +
            'display: inline-block;'+
            'color: white;' +
            'background: black;' +
            'border: 1px solid grey;' +
            'padding: 2px;' +
            'font-size: 10px;' +
            'line-height: 10px;' +
            'font-family: Arial, Helvetica, sans-serif;' +
            'margin: auto;'+
            '"></span></span>';
        var userCounter = 0;
        self.$hege.updateUser = function($world, world, user, userAttached) {
            var $user = userAttached.$user;
            if (self.$hege.options.passengerColor) {
                $user.css('color', ageColStr(world.elapsedTime - user.spawnTimestamp));
            } else {
                $user.css('color', '');
            }

            if (self.$hege.options.passengerDestionation) {
                if (!userAttached.$info) {
                    userAttached.$info = $(INFO_TEMPLATE);
                    userAttached.$info.children().text(''+user.destinationFloor);
                    if (self.$hege.passengerDestionationPlacement) {
                        userAttached.$info.css('top', (userCounter++%2) ? '20px' : '-20px');
                    }
                    $user.append(userAttached.$info);
                }
            } else {
                if (userAttached.$info) {
                    userAttached.$info.detach();
                    userAttached.$info = null;
                }
            }
        };


        self.$hege.old_presentChallenge = self.$hege.old_presentChallenge || self.presentChallenge;
        self.presentChallenge = function($parent, challenge, app, world, worldController, challengeNum, challengeTempl) {
            var fineSpeedAdjustment = self.$hege.options.fineSpeedAdjustment;
            var $challenge = $(riot.render(challengeTempl, {
                challenge: challenge,
                num: challengeNum,
                timeScale: worldController.timeScale.toFixed(fineSpeedAdjustment ? 3 : 0) + "x",
                startButtonText: world.challengeEnded ? "<i class='fa fa-repeat'></i> Restart" : (worldController.isPaused ? "Start" : "Pause")
            }));
            if (fineSpeedAdjustment) {
                $challenge.find('span').css('width', '80px');
            }
            $parent.html($challenge);

            $parent.find(".startstop").on("click", function() {
                app.startStopOrRestart();
            });
            $parent.find(".timescale_increase").on("click", function(e) {
                if (!fineSpeedAdjustment) {
                    e.preventDefault();
                    var timeScale = Math.round(worldController.timeScale * 1.618);
                    worldController.setTimeScale(timeScale);
                } else {
                    e.preventDefault();
                    var myTimeScaletimeScale = worldController.timeScale * 1.618;
                    if (myTimeScaletimeScale > 0.8) myTimeScaletimeScale = Math.round(myTimeScaletimeScale);
                    worldController.setTimeScale(myTimeScaletimeScale);
                }
            });
            $parent.find(".timescale_decrease").on("click", function(e) {
                if (!fineSpeedAdjustment) {
                    e.preventDefault();
                    var timeScale = Math.round(worldController.timeScale / 1.618);
                    worldController.setTimeScale(timeScale);
                } else {
                    e.preventDefault();
                    var myTimeScaletimeScale = worldController.timeScale / 1.618;
                    if (myTimeScaletimeScale > 0.8) myTimeScaletimeScale = Math.round(myTimeScaletimeScale);
                    worldController.setTimeScale(myTimeScaletimeScale);
                }
            });
        };

        self.$hege.old_presentWorld = self.$hege.old_presentWorld || self.presentWorld;
        self.presentWorld = function ($world, world) {
            var result = self.$hege.old_presentWorld.apply(self, arguments);
            world.on('new_user', function (user) {
                var userAttached = {
                    $user: $world.children().last()
                };
                user.on('new_state', function () {
                    self.$hege.updateUser($world, world, user, userAttached);
                });
            });
            return result;
        };
    }

    function scheduleRemoveScript() {
        var savedCurrentScript = self.currentScript;
        if (savedCurrentScript) {
            self.setTimeout(function () {
                savedCurrentScript.parentNode.removeChild(savedCurrentScript);
            }, 100);
        }
    }
    scheduleRemoveScript();

    self.$hege.setup = setup;

    self.$hege.setup({
        passengerDestionation: true,
        passengerDestionationPlacement: false,
        passengerColor: true,
        fineSpeedAdjustment: true
    });
})(self, $, riot);
