class Sudoku{  
  constructor(matrix){
    this.matrix = this.init(matrix);  
    this.values = [1, 2, 3, 4, 5, 6, 7, 8, 9];    
    this.length = 3;   
  }

  init(matrix){
    let newMatrix = new Array(matrix.length);      
    for(let i = 0; i < matrix.length; i++){
      newMatrix[i] = new Array(matrix.length);      
      for(let j = 0; j < matrix.length; j++){
        newMatrix[i][j] = {
          solutions: null,
          value: matrix[i][j]
        }
      }
    }   
    return newMatrix;
  }  
  
  cycle(callback){    
    for(let i = 0; i < this.matrix.length; i++){
      for(let j = 0; j < this.matrix.length; j++){
        callback(i, j);
      }
    }          
  }
  
  union(arrays){
    return arrays.reduce((prev, current) => {
      return [...current, ...prev];
    }, []);
  }  

  intersects(arrays){
    return arrays.reduce((prev, current) => {       
      return prev.length == 0 ? current : [...new Set(current)].filter(x => new Set(prev).has(x))
    }, []);    
  }

  difference(arrays) {
    return arrays.reduce((prev, current) => {       
      return prev.length == 0 ? current : [...new Set(current)].filter(x => !new Set(prev).has(x))
    }, []);  
  }
  
  symmetricDifference(arrays) {
    return [...new Set([...this.difference(arrays), ...this.difference(arrays.reverse())])];
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
    return internal;
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

  getValues(array){
    return array.map(x => {
      return x.value;
    });
  }

  getSolutions(array){
    return array.map(x => {
      return x.solutions;
    }).filter(x => {
      return x != null
    });
  }

  intersectSearch(i, j){
    let internal = this.getMatrix(i, j);
    let arrays = [
      this.getPosibleValues(this.getValues(this.union(internal))), 
      this.getPosibleValues(this.getValues(this.getColumn(j))), 
      this.getPosibleValues(this.getValues(this.getRow(i)))
    ];
    return this.intersects(arrays);    
  }  

  singletoneSearch(){  
    let counter = 0;  
    while(1){        
      let changed = false;   
      this.cycle((i, j) => {
        let element = this.matrix[i][j];        
        if(element.value == 0){
          let posibleValues = this.intersectSearch(i, j);
          if(posibleValues.length == 1){              
            this.matrix[i][j].value = posibleValues[0];
            this.matrix[i][j].solutions = null;
            changed = true;
          }
          else{                   
            this.matrix[i][j].solutions = posibleValues.length == 0 ? null : posibleValues;
            this.matrix[i][j].value = 0;
          }                       
        }
      });
      if(!changed){
        break;
      }
      counter++;
    } 
    return counter > 0;       
  }

  diffSearch(){
    this.cycle((i, j) => {
      let element = this.matrix[i][j];
      if(element.solutions != null){        
        let row = new Set(this.union(this.getSolutions(this.getRow(i)).filter(x => x != element.solutions)));
        let column = new Set(this.union(this.getSolutions(this.getColumn(j)).filter(x => x != element.solutions)));        
        let matrix = new Set(this.union(this.getSolutions(this.union(this.getMatrix(i, j))).filter(x => x != element.solutions)));
        element.solutions.forEach(x => {
          if(!row.has(x) && !column.has(x) && !matrix.has(x)){
            this.matrix[i][j].solutions = null;
            this.matrix[i][j].value = x;
            return true;
          }
        });        
      }          
    });   
    return false;
  }

  solve(){ 
    let changed = true;
    while(changed){      
      changed = this.singletoneSearch();
      if(!changed){
        changed = this.diffSearch();
      }      
      if(!changed){
        break;
      }
    }     
    this.cycle((i, j) => {
      this.matrix[i][j] = this.matrix[i][j].value;      
    });       
    return this.matrix;
  }  

  // singletone(arrays){
  //   let union = arrays.reduce((prev, current) => {       
  //     return [...prev, ...current]
  //   }, []);
  //   let map = new Map();
  //   union.forEach(x => {
  //     let number = map.get(x);
  //     if(!number){
  //       number = 0;
  //     }
  //     map.set(x, ++number);
  //   });
  //   let unique = [];
  //   for(let [key, value] of map){
  //     if(value == 1){
  //       unique.push(key);
  //     }
  //   }
  //   if(unique.length == 1){
  //     return unique[0];
  //   }
  //   return undefined;
  // }

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
