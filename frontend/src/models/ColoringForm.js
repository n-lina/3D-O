import { types } from "mobx-state-tree";
import html2canvas from 'html2canvas';
import DrawingSectionModel from './DrawingSectionModel'
import ReactDOM from 'react-dom';

const fileType = {
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  PDF: 'application/pdf'
};

const DEFAULT_PNG = {
  fileName: 'my-3do-diagram.png',
  type: fileType.PNG,
  html2CanvasOptions: {}
};

const saveAs = (uri, filename) => {
  const link = document.createElement('a');

  if (typeof link.download === 'string') {
      link.href = uri;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  } else {
      window.open(uri);
  }
};

const exportComponentBak = (node, {
  fileName, 
  type, 
  html2CanvasOptions, 
  pdfOptions
}) => {
  if(!node.current) {
      throw new Error("'node' must be a RefObject")
  }

  const element = ReactDOM.findDOMNode(node.current);
  return html2canvas(element, {
      scrollY: -window.scrollY,
      useCORS: true,
      ...html2CanvasOptions
  }).then(canvas => {
      console.log(canvas.toDataURL(type, 1.0))
      // saveAs(canvas.toDataURL(type, 1.0), fileName);
  });
};

const exportComponentAsPNG = (node, parameters = {}) => exportComponentBak(node, {...DEFAULT_PNG, ...parameters});

const ColoringForm = types
  .model("ColoringForm", {
    selectedColor: "#FF0000",
    defaultColor: "#FFFFFF",
    oldDefault: "#FFFFFF",
    clear: false,
    mode: false,
    maxWidth: 53,
    canvasPic: "",
    model: "vase", // vase, swan, fig, basket
    inverted: false,
    swan_two_wings: false,
    coloringFormData: types.optional(types.array(DrawingSectionModel), [])
  })
  .actions(self => ({
    storePic(picData){
      self.canvasPic = picData
      return
    }
  }))
  .actions(self => ({ 
    setColor(col){
      self.clear = false
      self.selectedColor = col
    },
    setModel(model, swan_one_wing){
      self.model = model
      if (model == "swan"){
        self.swan_two_wings = swan_one_wing
      }
    },
    setDefaultColor(col){
      self.clear = false
      self.oldDefault = self.defaultColor
      self.defaultColor = col
    },
    clearAll(){
      if (self.defaultColor == "#FFFFFF"){
        self.oldDefault = "#FFFFFE" 
        self.defaultColor = "#FFFFFE"
      }
      else {
        self.oldDefault = "#FFFFFF" 
        self.defaultColor = "#FFFFFF"
      }
      self.clear = true
    }, 
    unsetClear(){
      self.clear = false
    },
    setMode(val){
      self.clear = false
      self.mode = val
    }, 
    setInverted(val=true){
      self.inverted = val
    },
    exportComponent (node) {
      if(!node.current) {
          throw new Error("'node' must be a RefObject")
      }
      const element = ReactDOM.findDOMNode(node.current);
      return html2canvas(element, {
          scrollY: -window.scrollY,
          useCORS: true,
          // ...html2CanvasOptions
          imageTimeout: 0,
          backgroundColor: "#FFFFFF"
      }).then(canvas => {
          // self.canvasPic = canvas.toDataURL(DEFAULT_PNG, 0.1)
          self.storePic(canvas.toDataURL(DEFAULT_PNG, 0.1))
      });
    },
    saveDiagram () {
      saveAs(self.canvasPic, "my-3do-diagram")
    },
    addDrawingSection(){
      self.coloringFormData.push(DrawingSectionModel.create())
    }
  }))
  .views(self => ({
    // status() {
    //   return self.is_paid ? "Paid" : "Not Paid";
    // }
  }));

export default ColoringForm;
