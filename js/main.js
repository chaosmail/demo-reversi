// Setup Angular App
var app = angular.module('reversi', []);

// Main Controller
var MainCtrl = function($scope) {

    $scope.game = {"token":[
                    {r:4, c:4, player:0},
                    {r:4, c:5, player:1},
                    {r:5, c:4, player:1},
                    {r:5, c:5, player:0}
                  ]};

};

// Reversi Game Directive
app.directive('reversiGame', function() {
    return {
        restrict: 'E',
        scope: {
            token:'=',
            numCols:'=cols',
            numRows:'=rows',
            w:'=width',
            h:'=height'
        },
        link: function(scope, element, attrs) {

            if (scope.svg === undefined) {

                var fieldSVG = d3.select(element[0])
                                .append("svg")
                                .attr("width", scope.w)
                                .attr("height", scope.h),
                    fieldColWidth = parseInt(scope.w/scope.numCols,10),
                    fieldColHeight = parseInt(scope.h/scope.numRows,10),
                    tokenRad = fieldColWidth > fieldColHeight ? fieldColHeight*0.4 : fieldColWidth*0.4;

                fieldSVG.append("line")
                        .attr("x1",0)
                        .attr("y1",0)
                        .attr("x2",0)
                        .attr("y2",scope.h)
                        .attr("stroke","#000")
                        .attr("stroke-width",4);

                fieldSVG.append("line")
                        .attr("x1",0)
                        .attr("y1",0)
                        .attr("x2",scope.w)
                        .attr("y2",0)
                        .attr("stroke","#000")
                        .attr("stroke-width",4);

                fieldSVG.append("line")
                        .attr("x1",scope.w)
                        .attr("y1",0)
                        .attr("x2",scope.w)
                        .attr("y2",scope.h)
                        .attr("stroke","#000")
                        .attr("stroke-width",4);

                fieldSVG.append("line")
                        .attr("x1",0)
                        .attr("y1",scope.h)
                        .attr("x2",scope.w)
                        .attr("y2",scope.h)
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

            scope.svg.selectAll("circle")
                    .data(scope.token)
                    .enter()
                    .append("circle")
                    .attr("cx", function(d) { return d.c * fieldColWidth - fieldColWidth*0.5; })
                    .attr("cy", function(d) { return d.r * fieldColHeight - fieldColHeight*0.5; })
                    .attr("r", tokenRad)
                    .attr("stroke", "#000")
                    .attr("stroke-width", 2)
                    .attr("fill", function (d) {
                        switch(d.player) {
                            case 0: return "red";
                            case 1: return "blue";
                        }
                    });
        }
    };
});
