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
          value: matrix[i][j],
          i: i,
          j: j,
          get id () {
            return i + "x" + j
          }          
        }
      }
    }   
    return newMatrix;
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

  difference(array1, array2) {
    return [...new Set(array1)].filter(x => !new Set(array2).has(x));
  }

  remove(array, element){
    return array.filter(x => x != element);
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
      for(let i = 0; i < this.matrix.length; i++){
        for(let j = 0; j < this.matrix.length; j++){
          let element = this.matrix[i][j];        
          if(element.value == 0){
            if(this.matrix[i][j].solutions && this.matrix[i][j].solutions.length == 1){
              this.matrix[i][j].value = this.matrix[i][j].solutions[0];
              this.matrix[i][j].solutions = null;              
            }
            else{
              let posibleValues = this.intersectSearch(i, j);
              if(posibleValues.length == 1){              
                this.matrix[i][j].value = posibleValues[0];
                this.matrix[i][j].solutions = null;
                changed = true;
              }
              else{                   
                if(this.matrix[i][j].solutions && this.matrix[i][j].solutions.length < posibleValues.lenght){
                  this.matrix[i][j].solutions = posibleValues;
                }else{
                  this.matrix[i][j].solutions = posibleValues.length == 0 ? null : posibleValues;
                }
                this.matrix[i][j].value = 0;
              }            
            }                      
          }
        }
      }
      if(!changed){
        break;
      }
      counter++;
    } 
    return counter > 0;       
  }

  hiddenSingletoneSearch(){
    let counter = 0;  
    while(1){        
      let changed = false;
      for(let i = 0; i < this.matrix.length; i++){
        for(let j = 0; j < this.matrix.length; j++){
          let element = this.matrix[i][j];
          if(element.solutions != null){   
            let row = this.getRow(i).filter(x => x.solutions && x.id != element.id);
            let column = this.getColumn(j).filter(x => x.solutions && x.id != element.id);
            let matrix = this.union(this.getMatrix(i, j)).filter(x => x.solutions && x.id != element.id);
            
            let rowSet = new Set(this.union(this.getSolutions(row)));        
            let rowDiff = this.difference(element.solutions, [...rowSet]);
            if(rowDiff.length == 1){
              this.matrix[i][j].value = rowDiff[0];
              this.matrix[i][j].solutions = null;
              column.forEach(x => {
                this.matrix[x.i][x.j].solutions  = this.remove(x.solutions, rowDiff[0]);
              });
              matrix.forEach(x => {
                this.matrix[x.i][x.j].solutions  = this.remove(x.solutions, rowDiff[0]);
              });
              changed = true;
              continue;
            } 

            let columnSet = new Set(this.union(this.getSolutions(column).filter(x => x != element.solutions)));        
            let columnDiff = this.difference(element.solutions, [...columnSet]);
            if(columnDiff.length == 1){
              this.matrix[i][j].value = columnDiff[0];
              this.matrix[i][j].solutions = null;
              row.forEach(x => {
                this.matrix[x.i][x.j].solutions  = this.remove(x.solutions, columnDiff[0]);
              });
              matrix.forEach(x => {
                this.matrix[x.i][x.j].solutions  = this.remove(x.solutions, columnDiff[0]);
              });
              changed = true;
              continue;
            }

            let matrixSet = new Set(this.union(this.getSolutions(matrix).filter(x => x != element.solutions)));
            let matrixDiff = this.difference(element.solutions, [...matrixSet]);
            if(matrixDiff.length == 1){
              this.matrix[i][j].value = matrixDiff[0];
              this.matrix[i][j].solutions = null;
              column.forEach(x => {
                this.matrix[x.i][x.j].solutions  = this.remove(x.solutions, matrixDiff[0]);
              });
              row.forEach(x => {
                this.matrix[x.i][x.j].solutions  = this.remove(x.solutions, matrixDiff[0]);
              });
              changed = true;
              continue;
            }
          }          
        }
      }  
      if(!changed){
        break;
      }
      counter++;
    } 
    return counter > 0;         
  }

  swordfishSearch(){
    let counter = 0;      
    while(1){        
      let changed = false;        
      let v = 1;
      while(v < 10){
        let rows = [];
        for(let i = 0; i < this.matrix.length; i++){
          let row = this.getRow(i).filter(x => x.solutions != null);
          let columns = [];
          row.forEach(x => {
            if(x.solutions.indexOf(v) >= 0){
              columns.push(x);
            }
          });
          if(columns.length >= 1 && columns.length <= this.length){
            rows.push(columns);
          }          
        }
        if(rows.length === this.length){
          let columnNumbers = [...new Set(this.union(rows).map(x => x.j))];
          let rowNumbers = [...new Set(this.union(rows).map(x => x.i))];
          if(columnNumbers.length === this.length){
            columnNumbers.forEach(x => {
              let column = this.getColumn(x).filter(c => c.solutions && rowNumbers.indexOf(c.i) < 0);
              column.forEach(y => {
                let solutions = this.remove(y.solutions, v);
                if(this.matrix[y.i][y.j].solutions && solutions.length < this.matrix[y.i][y.j].solutions.length){
                  this.matrix[y.i][y.j].solutions = solutions;
                  changed = true;
                }
              })              
            });
          }
        }
        v++;
      }      
      if(!changed){
        break;
      }
      counter++;
    } 
    return counter > 0;   
  }

  solve(){ 
    let changed = true;
    while(changed){      
      changed = this.singletoneSearch();
      if(!changed){
        changed = this.hiddenSingletoneSearch();
      }  
      if(!changed){
        changed = this.swordfishSearch();
      }     
      if(!changed){
        break;
      }
    }    
    console.log(this.matrix.map(x => {
      return x.map(y => {
        var str = y.solutions == null ? "" : y.solutions.toString();
        return "[" + y.value + ": " + str + "]";
      })
    })); 
    for(let i = 0; i < this.matrix.length; i++){
      for(let j = 0; j < this.matrix.length; j++){
        this.matrix[i][j] = this.matrix[i][j].value;      
      }
    }    
    return this.matrix;
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
