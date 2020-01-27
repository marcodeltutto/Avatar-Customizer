import * as THREE from "three";
import React, { Component } from "react";
import PropTypes from "prop-types";
import {faDownload} from "@fortawesome/free-solid-svg-icons/faDownload";
import {faUpload} from "@fortawesome/free-solid-svg-icons/faUpload";
import {faTimes} from "@fortawesome/free-solid-svg-icons/faTimes";
import {faCheckSquare} from "@fortawesome/free-regular-svg-icons/faCheckSquare";
import {faSquare} from "@fortawesome/free-regular-svg-icons/faSquare";
import { ColorPicker } from "./color-picker";
import { TextureDropdown } from "./texture-dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export class TextureLayer extends Component {
  static propTypes = {
    material: PropTypes.object,
    label: PropTypes.string,
    path: PropTypes.string,
    filenames: PropTypes.arrayOf(PropTypes.string),
    enableTint: PropTypes.bool,
    disableable: PropTypes.bool,
    disabled: PropTypes.bool
  };

  static defaultProps = {
    enableTint: true,
    disableable: false,
    disabled: false
  };

  constructor(props) {
    //material, path filenames
    super(props);
    this.props.material.transparent = true;
    this.props.material.needsUpdate = true;
    this.material = null;
    this.textures = {};
    this.key = null;
    this.colorPicker = React.createRef();
    this.defaultColor = "#ffffff";

    this.filenames = this.props.filenames;
    if(this.props.disableable) {
      this.filenames.unshift('');
    }

    this.state = {
      disabled: props.disabled
    };

    if (this.props.path && this.props.filenames) {
      this.props.filenames.forEach(fname => {
        this.textures[fname] = null;
      });
      this.setTexture(this.filenames[0]);
    }

    if (this.props.label) {
      const clr = new THREE.Color(0, 0, 0).setHex(Math.random() * 0xffffff);
      this.defaultColor = "#" + clr.getHexString();
    }
  }

  setTexture(key) {
    if (key == '') {
      this.key = key;
      this.props.material.visible = false;
      this.props.material.needsUpdate = true;
      return;
    }
    
    if (!this.props.path || this.key == key) return;
    
    if (!(key in this.textures)) this.textures[key] = null;
    
    if (this.textures[key]) {
      this.props.material.map = this.textures[key];
      this.props.material.visible = true;
      this.props.material.needsUpdate = true;
    } else {
      const loader = new THREE.TextureLoader();
      loader.load(this.props.path + key + ".png", texture => {
        this.props.material.visible = true;
        texture.flipY = false;
        this.props.material.map = texture;
        this.props.material.needsUpdate = true;
      });
    }
    this.key = key;
  }

  getDownloadTexture() {
    const canvas = window.document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;

    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "copy";
    ctx.drawImage(this.props.material.map.image, 0, 0);
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "#" + this.props.material.color.getHexString();
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.globalCompositeOperation = "destination-atop";
    ctx.drawImage(this.props.material.map.image, 0, 0);

    return canvas;
  }

  randomize() {
    if (this.colorPicker.current == null) return;
    this.colorPicker.current.randomize();
  }

  render() {

    if (this.props.enableTint == false) return null;
    const dropdown = () => {
      if (this.props.filenames && this.props.filenames.length > 1)
        return (
          <TextureDropdown
            filenames={this.props.filenames}
            setTexFunc={e => this.setTexture(e)}
          />
        );
      return null;
    };
    return (
      <div>
        {this.props.label}
        <FontAwesomeIcon icon={faDownload} title="Download layout PNG to customize"/>
        <FontAwesomeIcon icon={faUpload} title="Upload custom layer texture"/>
        {dropdown()}
        <ColorPicker
          label={this.props.label}
          disabled={this.state.disabled}
          material={this.props.material}
          defaultColor={this.defaultColor}
          ref={this.colorPicker}
        />
      </div>
    );
  }

  //clone base material
  //load list of textures and store in as keyvals based on file names
  //set current tex to first in group

  //function for applying current tint to
}