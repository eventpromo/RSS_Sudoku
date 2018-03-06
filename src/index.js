class Sudoku{  
  constructor(matrix, withoutInit = false){
    this.matrix = withoutInit ? matrix : this.init(matrix);  
    this.values = [1, 2, 3, 4, 5, 6, 7, 8, 9];    
    this.length = 3;   
  }

  get state(){
    return this.matrix;
  }

  toValue(){
    for(let i = 0; i < this.matrix.length; i++){
      for(let j = 0; j < this.matrix.length; j++){
        this.matrix[i][j] = this.matrix[i][j].value;      
      }
    }  
    return this.matrix;    
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

  remove(array, elements){
    let set = new Set(elements);    
    return array.filter(x => !set.has(x));
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

  compare(array1, array2) {
    return array1.length == array2.length && array1.every((v,i) => v === array2[i])
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
            if(element.solutions && element.solutions.length == 1){
              this.clearSingletone(element);           ;
            }
            else{
              let posibleValues = this.intersectSearch(i, j);
              if(posibleValues.length == 1){              
                this.matrix[i][j].value = posibleValues[0];
                this.matrix[i][j].solutions = null;
                changed = true;
              }
              else{                   
                if(this.matrix[i][j].solutions && this.matrix[i][j].solutions.length < posibleValues.length){
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
            if(element.solutions.length == 1){              
              this.clearSingletone(element);
              changed = true;
              continue;                           
            }
            
            let row = this.getRow(i).filter(x => x.solutions && x.id != element.id);
            let column = this.getColumn(j).filter(x => x.solutions && x.id != element.id);
            let matrix = this.union(this.getMatrix(i, j)).filter(x => x.solutions && x.id != element.id);

            let rowSet = new Set(this.union(this.getSolutions(row)));        
            let rowDiff = this.difference(element.solutions, [...rowSet]);
            if(rowDiff.length == 1){              
              column.forEach(x => {
                this.matrix[x.i][x.j].solutions  = this.remove(x.solutions, rowDiff);
              });
              matrix.forEach(x => {
                this.matrix[x.i][x.j].solutions  = this.remove(x.solutions, rowDiff);
              });
              this.matrix[i][j].value = rowDiff[0];
              this.matrix[i][j].solutions = null;
              changed = true;
              continue;
            } 
            
            let columnSet = new Set(this.union(this.getSolutions(column)));        
            let columnDiff = this.difference(element.solutions, [...columnSet]);
            if(columnDiff.length == 1){              
              row.forEach(x => {
                this.matrix[x.i][x.j].solutions  = this.remove(x.solutions, columnDiff);
              });
              matrix.forEach(x => {
                this.matrix[x.i][x.j].solutions  = this.remove(x.solutions, columnDiff);
              });
              this.matrix[i][j].value = columnDiff[0];
              this.matrix[i][j].solutions = null;
              changed = true;
              continue;
            }
            
            let matrixSet = new Set(this.union(this.getSolutions(matrix)));
            let matrixDiff = this.difference(element.solutions, [...matrixSet]);
            if(matrixDiff.length == 1){              
              column.forEach(x => {
                this.matrix[x.i][x.j].solutions  = this.remove(x.solutions, matrixDiff);
              });
              row.forEach(x => {
                this.matrix[x.i][x.j].solutions  = this.remove(x.solutions, matrixDiff);
              });
              this.matrix[i][j].value = matrixDiff[0];
              this.matrix[i][j].solutions = null;
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

  pairSearch(){
    let counter = 0;  
    while(1){        
      let changed = false;
      for(let i = 0; i < this.matrix.length; i++){
        for(let j = 0; j < this.matrix.length; j++){ 
          let element = this.matrix[i][j];       
          if(element.solutions){
            if(element.solutions.length == 1){    
              this.clearSingletone(element);
              changed = true;
              continue;                           
            }
  
            if(element.solutions.length == 2){
              let row = this.getRow(i).filter(x => x.solutions);
              changed = this.clearPair(element, row); 
              if(!changed){
                let column = this.getColumn(j).filter(x => x.solutions);
                changed = this.clearPair(element, column);
              }
              if(!changed){
                let matrix = this.union(this.getMatrix(i, j)).filter(x => x.solutions);
                changed = this.clearPair(element, matrix);
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

  clearSingletone(element){
    let row = this.getRow(element.i).filter(x => x.solutions && x.id != element.id);
    let column = this.getColumn(element.j).filter(x => x.solutions && x.id != element.id);
    let matrix = this.union(this.getMatrix(element.i, element.j)).filter(x => x.solutions && x.id != element.id);
    
    column.forEach(x => {
      this.matrix[x.i][x.j].solutions = this.remove(x.solutions, element.solutions);
    });
    matrix.forEach(x => {
      this.matrix[x.i][x.j].solutions = this.remove(x.solutions, element.solutions);
    });
    row.forEach(x => {
      this.matrix[x.i][x.j].solutions = this.remove(x.solutions, element.solutions);
    });
    this.matrix[element.i][element.j].value = element.solutions[0];
    this.matrix[element.i][element.j].solutions = null; 
  }

  clearPair(element, block){
    let changed = false;
    let pair = block.filter(x => this.compare(element.solutions, x.solutions));
    if(pair.length == 2){
      block.forEach(x => {
        if(pair[0].id != x.id && pair[1].id != x.id){
          let solutions = this.remove(x.solutions, element.solutions)
          if(solutions.length < this.matrix[x.i][x.j].solutions.length){
            if(solutions.length == 1){
              this.clearSingletone(this.matrix[x.i][x.j]);
            }else{
              this.matrix[x.i][x.j].solutions = solutions;
            }            
            changed = true;
          }          
        }
      });
    }
    return changed;
  }

  swordfishSearch(){
    let counter = 0;      
    while(1){        
      let changed = false;        
      let v = 1;
      while(v < 10){
        let rows = [];
        let columns = [];

        for(let i = 0; i < this.matrix.length; i++){
          let row = this.getRow(i).filter(x => x.solutions != null);
          let column = this.getColumn(i).filter(x => x.solutions != null);
          
          rows.push(row.filter(x => x.solutions.indexOf(v) >= 0));
          columns.push(column.filter(x => x.solutions.indexOf(v) >= 0));          
        } 

        rows = rows.filter(x => x.length >= 1 && x.length <= 3 );        
        if(rows.length === 3){
          let columnNumbers = [...new Set(this.union(rows).map(x => x.j))];
          let rowNumbers = [...new Set(this.union(rows).map(x => x.i))];
          if(columnNumbers.length === 3){
            columnNumbers.forEach(x => {
              let column = this.getColumn(x).filter(c => c.solutions && rowNumbers.indexOf(c.i) < 0);
              column.forEach(y => {
                let solutions = this.remove(y.solutions, [v]);
                if(this.matrix[y.i][y.j].solutions && solutions.length < this.matrix[y.i][y.j].solutions.length){
                  if(solutions.length == 1){
                    this.clearSingletone(this.matrix[y.i][y.j]);
                  }else{
                    this.matrix[y.i][y.j].solutions = solutions;
                  }                      
                  changed = true;
                }
              })              
            });
          }          
        }     
        if(!changed){
          columns = columns.filter(x => x.length >= 1 && x.length <= 3 );
          if(columns.length === 3){
            let columnNumbers = [...new Set(this.union(columns).map(x => x.j))];
            let rowNumbers = [...new Set(this.union(columns).map(x => x.i))];
            if(rowNumbers.length === 3){
              rowNumbers.forEach(x => {
                let row = this.getRow(x).filter(c => c.solutions && columnNumbers.indexOf(c.j) < 0);
                row.forEach(y => {
                  let solutions = this.remove(y.solutions, [v]);
                  if(solutions.length < this.matrix[y.i][y.j].solutions.length){
                    if(solutions.length == 1){
                      this.clearSingletone(this.matrix[y.i][y.j]);
                    }else{
                      this.matrix[y.i][y.j].solutions = solutions;
                    }                      
                    changed = true;
                  }
                });            
              });
            }
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

  check(){    
    for(let i = 0; i < this.matrix.length; i++){
      let column = new Set(this.getColumn(i).map(x => x.value));
      if(column.has(0) || column.size < 9){
        return false;
      }
      let row = new Set(this.getRow(i).map(x => x.value));
      if(row.has(0) || row.size < 9){
        return false;
      }
    }
    return true;
  }

  randomSearch(){
    if(this.check()){              
      return this.matrix;
    }
    for(let i = 0; i < this.matrix.length; i++){
      for(let j = 0; j < this.matrix.length; j++){
        let element = this.matrix[i][j];
        if(element.solutions && element.solutions.length > 1){
          for(let k = 0; k < element.solutions.length; k++){
            let solution = element.solutions[k];
            let copy = JSON.parse(JSON.stringify(this.matrix));
            copy[i][j].value = solution;
            copy[i][j].solutions = null;
            let temp = new Sudoku(copy, true);            
            let checking = new Sudoku(temp.search(), true);
            if(checking.check()){                  
              return checking.state;
            }
          }
        }
      }
    }
    return this.matrix;
  }  

  search(){ 
    let changed = true;
    while(changed){      
      changed = this.singletoneSearch();
      if(!changed){
        changed = this.hiddenSingletoneSearch();
      }  
      if(!changed){
        changed = this.pairSearch();
      } 
      if(!changed){
        changed = this.swordfishSearch();
      }     
      if(!changed){
        break;
      }
    }  
    if(!this.check()){
      return this.randomSearch();
    }    
    
    return this.matrix;
  }  
  
  solve(){
    this.matrix = this.search();
    this.toValue();
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
