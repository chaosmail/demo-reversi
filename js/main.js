// Setup Angular App
var app = angular.module('reversi', []);

// Main Controller
app.controller("MainCtrl", ['$scope', 'reversiGame', function($scope, reversiGame) {

    reversiGame.setNumCols(8);

    reversiGame.addPlayer({name:"Max Muster",color:"red"});
    reversiGame.addPlayer({name:"Sepp Schnorcher",color:"blue"});

    reversiGame.addToken({r:4, c:4, player:0});
    reversiGame.addToken({r:4, c:5, player:1});
    reversiGame.addToken({r:5, c:4, player:1});
    reversiGame.addToken({r:5, c:5, player:0});

    $scope.game = {players: reversiGame.getAllPlayers(),
                   player: reversiGame.getActualPlayer(),
                   token: reversiGame.getAllTokens()};

    $scope.$watch("game",function(newVal,oldVal){
        // Workaround for 2-way binding of primitives
        $scope.game.player = reversiGame.getActualPlayer();
    },true);

}]);

// Reversi Game Service
app.factory('reversiGame',function() {

    var token = [],
        move = 0,
        numCols = 0,
        players = [],
        player = 0,
        points = {"capture":1},
        getActualPlayer = function() { return players[player]; },
        getAllPlayers = function() { return players; },
        getPlayer = function(i) { return players[i]; },
        getAllTokens = function() { return token; };

    var cloneSimpleObject = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    var setNumCols = function(cols) {
        numCols = cols;
    };

    var isStepAllowed = function(data) {

        var c = data.c,
            r = data.r;

        for (var i in token) {
            var t = token[i];

            // Feld ist schon belegt
            if (t.c === c && t.r === r) {
                return false;
            }
        }

        return true;
    };

    var addPlayer = function(data) {

        if (!data.hasOwnProperty("wins")) {
            data["wins"] = 0;
        }

        if (!data.hasOwnProperty("points")) {
            data["points"] = 0;
        }

        players.push(data);
    };

    var checkCaptureToken = function(data) {

        var c = data.c,
            r = data.r,
            p = data.player,
            captured = [],
            len = token.length,
            capture = {row:false,col:false,diaLeft:false,diaRight:false},
            captureStart = {row:0,col:0,diaLeft:0,diaRight:0},
            i = 0,
            t;

        for (i=0;i<len;i++) {
            t = token[i];

            // Capture in same row from left
            // . . . . . .
            // . 0 X X 0 .
            // . . . . ^ .
            if (t.r === r) {
                if (capture.row===true && t.c > c) {
                    capture.row = false;
                    captureStart.row = 0;
                }
                if (capture.row===true && t.player !== p && t.c > captureStart.row) {
                    captured.push(t.move);
                }
                if (capture.row===false && t.player === p && t.c < c) {
                    capture.row = true;
                    captureStart.row = t.c;
                }
            }

            // Capture in same col from top
            // . . .
            // . 0 .
            // . X .
            // . X .
            // . 0 <
            // . . .
            if (t.c === c) {
                if (capture.col===true && t.r > r) {
                    capture.col = false;
                    captureStart.col = 0;
                }
                if (capture.col===true && t.player !== p && t.r > captureStart.col) {
                    captured.push(t.move);
                }
                if (capture.col===false && t.player === p && t.r < r) {
                    capture.col = true;
                    captureStart.col = t.r;
                }
            }

            // Capture from diagonal left top
            // . . . . . .
            // . 0 . . . .
            // . ^ X . . .
            // . . . X . .
            // . . . . 0 .
            // . . . . . .
            if (t.c - c === t.r - r) {
                if (capture.diaLeft===true && t.r > r) {
                    capture.diaLeft = false;
                    captureStart.diaLeft = 0;
                }
                if (capture.diaLeft===true && t.player !== p && t.r > captureStart.diaLeft) {
                    captured.push(t.move);
                }
                if (capture.diaLeft===false && t.player === p && t.r < r) {
                    capture.diaLeft = true;
                    captureStart.diaLeft = t.r;
                }
            }

            // Capture from diagonal right top
            // . . . . . .
            // . . . . 0 .
            // . . . X ^ .
            // . . X . . .
            // . 0 . . . .
            // . . . . . .
            if (t.c - c === -(t.r - r)) {
                if (capture.diaRight===true && t.r > r) {
                    capture.diaRight = false;
                    captureStart.diaRight = 0;
                }
                if (capture.diaRight===true && t.player !== p && t.r > captureStart.diaRight) {
                    captured.push(t.move);
                }
                if (capture.diaRight===false && t.player === p && t.r < r) {
                    capture.diaRight = true;
                    captureStart.diaRight = t.r;
                }
            }
        }

        capture = {row:false,col:false,diaLeft:false,diaRight:false};
        captureStart = {row:0,col:0,diaLeft:0,diaRight:0};

        for (i=len-1;i>=0;i--) {
            t = token[i];

            // Capture in same row from right
            // . . . . . .
            // . 0 X X 0 .
            // . ^ . . . .
            if (t.r === r) {
                if (capture.row===true && t.c < c) {
                    capture.row = false;
                    captureStart.row = 0;
                }
                if (capture.row===true && t.player !== p && t.c < captureStart.row) {
                    captured.push(t.move);
                }
                if (capture.row===false && t.player === p && t.c > c) {
                    capture.row = true;
                    captureStart.row = t.c;
                }
            }

            // Capture in same col from bottom
            // . . .
            // . 0 <
            // . X .
            // . X .
            // . 0 .
            // . . .
            if (t.c === c) {
                if (capture.col===true && t.r < r) {
                    capture.col = false;
                    captureStart.col = 0;
                }
                if (capture.col===true && t.player !== p && t.r < captureStart.col) {
                    captured.push(t.move);
                }
                if (capture.col===false && t.player === p && t.r > r) {
                    capture.col = true;
                    captureStart.col = t.r;
                }
            }

            // Capture from diagonal left bottom
            // . . . . . .
            // . 0 . . . .
            // . . X . . .
            // . . . X . .
            // . . . . 0 .
            // . . . . ^ .
            if (t.c - c === t.r - r) {
                if (capture.diaLeft===true && t.r < r) {
                    capture.diaLeft = false;
                    captureStart.diaLeft = 0;
                }
                if (capture.diaLeft===true && t.player !== p && t.r < captureStart.diaLeft) {
                    captured.push(t.move);
                }
                if (capture.diaLeft===false && t.player === p && t.r > r) {
                    capture.diaLeft = true;
                    captureStart.diaLeft = t.r;
                }
            }

            // Capture from diagonal right bottom
            // . . . . . .
            // . . . . 0 .
            // . . . X . .
            // . . X . . .
            // . 0 . . . .
            // . ^ . . . .
            if (t.c - c === -(t.r - r)) {
                if (capture.diaRight===true && t.r < r) {
                    capture.diaRight = false;
                    captureStart.diaRight = 0;
                }
                if (capture.diaRight===true && t.player !== p && t.r < captureStart.diaRight) {
                    captured.push(t.move);
                }
                if (capture.diaRight===false && t.player === p && t.r > r) {
                    capture.diaRight = true;
                    captureStart.diaRight = t.r;
                }
            }
        }

        // Modify tokens at the end of the move
        i = len-1;
        while (i>=0) {

            t = token[i];

            console.log(t.move, captured.indexOf(t.move));

            if (captured.indexOf(t.move) >= 0) {

                t = cloneSimpleObject(t);
                t.player = p;

                // Remove Token
                token.splice(i, 1);

                // Add Token from other player
                _addToken(t);

                players[data.player].points += points.capture;
            }

            i --;
        }
    };

    var _addToken = function(data) {

        move += 1;
        data["move"] = move;
        data["gridPos"] = numCols*data.r+data.c;
        token.push(cloneSimpleObject(data));
        token.sort(function(a, b){ return a.gridPos - b.gridPos; });
    };

    var addToken = function(data, callback) {

        if (callback !== undefined) {
            // Step is not allowed
            if (!isStepAllowed(data)) {
                return false;
            }

            // Step is allowed
            if (!data.hasOwnProperty("player")) {
                data["player"] = player;
            }

            checkCaptureToken(data);

            _addToken(data);

            // Logging
            console.log(players[player].name," -> ",data.r,data.c);

            setNextPlayer();

            callback();
        }
        // Startup tokens
        else {
            _addToken(data);
        }
    };

    var setNextPlayer = function() {
        player = ((player+1) < players.length) ? player + 1 : 0;
    };

    return {
        setNumCols: setNumCols,
        getActualPlayer: getActualPlayer,
        getAllPlayers: getAllPlayers,
        getPlayer: getPlayer,
        getAllTokens: getAllTokens,
        addPlayer: addPlayer,
        addToken: addToken
    };
});

// Reversi Game Directive
app.directive("reversiField", ["reversiGame", function(reversiGame) {
    return {
        restrict: 'E',
        scope: {
            numCols:"=cols",
            numRows:"=rows",
            w:"=width",
            h:"=height"
        },
        link: function(scope, element, attrs) {

            scope.player = reversiGame.getActualPlayer();
            scope.token = reversiGame.getAllTokens();

            if (scope.svg === undefined) {

                var fieldSVG = d3.select(element[0]).append("svg")
                                .attr("width", scope.w).attr("height", scope.h),
                    hoverSVG = fieldSVG.append("g").attr("class","hover-token"),
                    fieldColWidth = parseInt(scope.w/scope.numCols,10),
                    fieldColHeight = parseInt(scope.h/scope.numRows,10),
                    tokenRad = fieldColWidth > fieldColHeight ? fieldColHeight*0.4 : fieldColWidth*0.4;

                fieldSVG.append("line")
                        .attr("x1",2)
                        .attr("y1",0)
                        .attr("x2",2)
                        .attr("y2",scope.h)
                        .attr("stroke","#000")
                        .attr("stroke-width",4);

                fieldSVG.append("line")
                        .attr("x1",0)
                        .attr("y1",2)
                        .attr("x2",scope.w)
                        .attr("y2",2)
                        .attr("stroke","#000")
                        .attr("stroke-width",4);

                fieldSVG.append("line")
                        .attr("x1",scope.w-2)
                        .attr("y1",0)
                        .attr("x2",scope.w-2)
                        .attr("y2",scope.h)
                        .attr("stroke","#000")
                        .attr("stroke-width",4);

                fieldSVG.append("line")
                        .attr("x1",0)
                        .attr("y1",scope.h-2)
                        .attr("x2",scope.w)
                        .attr("y2",scope.h-2)
                        .attr("stroke","#000")
                        .attr("stroke-width",4);

                for (var x=0; x<scope.numCols*fieldColWidth; x+=fieldColWidth) {
                    for (var y=0; y<scope.numRows*fieldColHeight; y+=fieldColHeight) {
                        fieldSVG.append("rect")
                                .attr("x",x)
                                .attr("y",y)
                                .attr("width",fieldColWidth)
                                .attr("height",fieldColHeight)
                                .attr("fill-opacity",0)
                                .attr("stroke","#000")
                                .attr("stroke-width",2);
                    }
                }

                scope.svg = fieldSVG;
            }

            scope.svg.selectAll("rect")
                    .on("mouseenter", function() {
                        var e = d3.select(this);

                        hoverSVG.append("circle")
                        .attr("cx", parseInt(e.attr("x"),10) + fieldColWidth*0.5)
                        .attr("cy", parseInt(e.attr("y"),10) + fieldColHeight*0.5)
                        .attr("r", tokenRad)
                        .attr("style","stroke-dasharray: 9, 5")
                        .attr("stroke", "#000")
                        .attr("stroke-width", 1.5)
                        .attr("fill-opacity", 0.2)
                        .attr("class","hover-token")
                        .attr("fill", function (d) {
                            var p = reversiGame.getActualPlayer();
                            return p.color;
                        });
                    })
                    .on("mouseleave", function() {
                        hoverSVG.selectAll('*').remove();
                    })
                    .on("click", function() {
                        var e = d3.select(this),
                            c = e.attr("x")/fieldColWidth + 1,
                            r = e.attr("y")/fieldColWidth + 1;

                        reversiGame.addToken({"c":c,"r":r}, function() {
                           scope.$apply();
                        });
                    });

            scope.$watch("token", function(newVal, oldVal, scope) {

                var fields = scope.svg.selectAll("circle").data(scope.token,function(d) {
                    //return newVal.indexOf(d);
                    if (d === undefined) return -1;
                    return d.move;
                });

                fields.exit().remove();

                fields.enter()
                    .append("circle")
                    .attr("cx", function(d) { return d.c * fieldColWidth - fieldColWidth*0.5; })
                    .attr("cy", function(d) { return d.r * fieldColHeight - fieldColHeight*0.5; })
                    .attr("r", 0)
                    .attr("fill", function (d) {
                        var p = reversiGame.getPlayer(d.player);
                        return p.color;
                    })
                    .attr("fill-opacity",0.6)
                    .transition()
                    .duration(100).ease("cubic-out")
                    .attr("fill-opacity",1)
                    .attr("r", tokenRad)
                    .attr("stroke", "#000")
                    .attr("stroke-width", 1.5);
            }, true);
        }
    };
}]);
