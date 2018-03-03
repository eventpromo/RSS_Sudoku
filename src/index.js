class Sudoku{  
  constructor(matrix){
    this.matrix = matrix;  
    this.values = [1, 2, 3, 4, 5, 6, 7, 8, 9];    
    this.length = 3; 
    this.solutions = new Map();
  }

  toArray(matrix){
    return matrix.reduce((prev, current) => {
      return current.concat(...prev);
    }, []);
  }  

  getMatrix(i, j){ 
    let internal = new Array(this.length);
    let xy = this.getXY(i, j);        
    for(let y = 0, i = xy.y * this.length; y < this.length; i++, y++){
      internal[y] = new Array(this.length);
      for(let x = 0, j = xy.x * this.length; x < this.length; j++, x++){
        internal[y][x] = this.matrix[i][j];
      }
    }        
    return internal
  }  

  getRow(index){
    return this.matrix[index];
  }

  getColumn(index){
    let column = [];
    for(let y = 0; y < this.matrix[index].length; y++){
      column.push(this.matrix[y][index]);
    }
    return column;
  }

  getXY(i, j){
    let x = Math.floor(j / this.length);
    let y = Math.floor(i / this.length)
    return {x, y};
  }  
  
  count(array, symbol){
    return array.filter(x => {x == symbol}).length;
  }

  solve(){    
    let iteration = 81;
    while(iteration--){
      for(let i = 0; i < this.matrix.length; i++){
        for(let j = 0; j < this.matrix.length; j++){
          if(this.matrix[i][j] == 0){
            let internal = this.getMatrix(i, j);
            let arrays = [
              this.getPosibleValues(this.toArray(internal)), 
              this.getPosibleValues(this.getColumn(j)), 
              this.getPosibleValues(this.getRow(i))
            ];
            let posibleValues = this.intersects(arrays);
            if(posibleValues.length == 1){
              this.matrix[i][j] = posibleValues[0];              
            }else{   
              let row = this.solutions.get(i);                            
              if(row != undefined){
                row.set(j, posibleValues)
                if(count(this.matrix[i], 0) === row.size){
                  posibleValues = diff(row.values());
                  if(posibleValues.length == 1){
                    this.matrix[i][j] = posibleValues[0];              
                  }
                }              
              }              
            }           
          }
        }
      }          
    }
    console.log(this.solutions);
    console.log(this.matrix.map(x => { return x.toString()}));
    return this.matrix;
  }  

  diff(arrays){
    return arrays.reduce((prev, current) => {       
      return prev.filter(x => { return current.indexOf(x) < 0;});
    }, []);
  }

  intersects(arrays){
    return arrays.reduce((prev, current) => {       
      return prev.length == 0 ? current : [...new Set(current)].filter(x => new Set(prev).has(x))
    }, []);    
  }

  getPosibleValues(currentValues = []){        
    let posibleValues = [];
    this.values.forEach(x => {
      if(currentValues.indexOf(x) < 0){
        posibleValues.push(x);
      }
    });
    return posibleValues; 
  }  
}

module.exports = function solveSudoku(matrix) {
  let sudoku = new Sudoku(matrix).solve();
  return sudoku;
}
