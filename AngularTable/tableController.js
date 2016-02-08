app.controller("basicCtrl", ["$scope", function($scope) {
    $scope.rowCollection = [];
    $scope.setrowCollection = function(d) {
        $scope.rowCollection = d;
        $scope.displayedCollection = [].concat($scope.rowCollection);
    }
    $scope.setitemsByPage = function(d) {
        $scope.itemsByPage = d;
    }
    $scope.itemsByPage = 10;
    $scope.removeItem = function removeItem(row) {
        var index = $scope.rowCollection.indexOf(row);
        if (index !== -1) {
            $scope.rowCollection.splice(index, 1);
        }
    }
    $scope.$watch(function() {
        console.log("Digesting!")
    });

    $scope.filter = function(val) {
        val = val || ''
        $scope.displayedCollection = [];
        $scope.rowCollection.forEach(function(d, i) {
            var include = false;
            Object.keys(d).forEach(function(d1, i1) {
                if (d[d1].toString().indexOf(val.toString()) >= 0) {
                    include = true;
                }
            })
            if (include) {
                $scope.displayedCollection.push(d)
            }
        })
    }

    // $scope.pipeFunction = function(tableState, ctrl) {
    //     console.log(tableState)
    // if (!$scope.stCtrl && ctrl) {
    //     $scope.stCtrl = ctrl;
    // }

    // if (!tableState && $scope.stCtrl) {
    //     $scope.stCtrl.pipe();
    //     return;
    // }
    // console.log(tableState)
    // tableState.start = tableState.pagination.start || 0;
    // tableState.number = tableState.pagination.number || 10;

    // get data
    // }
}]);