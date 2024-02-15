import React, { useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { Interactive } from '@react-three/xr'
import ThreeMeshUI from 'three-mesh-ui'
import { OrbitControls, DragControls } from '@react-three/drei'
import * as THREE from 'three'


//import './styles.css'

const padCol = (a, b, totalLength) => {
  let padding = ' ' // the padding character you want to use

  // calculate the length of padding needed between the two numbers
  let paddingLength = Math.max(0, totalLength - (a.length + b.length))

  // add the padding between the two numbers
  return a + padding.repeat(paddingLength) + b
}

extend(ThreeMeshUI)

const Title = (props) => {
  console.log("title", props.name)
  return (
    <block
      args={[
        {
          width: 1,
          height: 0.18,
          fontSize: 0.065,
          interLine: 0.0004,
          padding: 0.025,
          margin: 0.025,
          backgroundOpacity: 0.6,
          textAlign: 'center'
        }
      ]}>
      <text content={`${props.name}\n`} />
      <text fontSize={0.045} content={`Brand: ${props.brand} | Servings: ${props.servings}`} />
    </block>
  )
}

const NutritionBlock = (props) => {
  console.log(props.data.nutrients['Calcium'].percentage)
  return (
    <block
      args={[
        {
          width: 0.56,
          height: 0.9,
          fontSize: 0.045,
          whiteSpace: 'pre',
          backgroundOpacity: 0.6,
          padding: 0.025,
          textAlign: 'left'
        }
      ]}>
      <text fontSize={0.04} content={`Amt/Serving\n`} />
      <text content={`Calories: ${props.data.nutrients['Calories'].amount}         DV%\n`} />
      <text fontSize={0.045} content={`-------------------------\n`} />
      <text
        content={
          padCol(`Total Fat: ${props.data.nutrients['Total Fat'].amount}g`, `${Math.floor(props.data.nutrients['Total Fat'].percentage * 100)}%`, 25) + '\n'
        }
      />
      <text
        content={padCol(`Sat. Fat: ${props.data.nutrients['Saturated Fat'].amount}g`, `${props.data.nutrients['Saturated Fat'].percentage * 100}%`, 26) + '\n'}
      />
      <text
        content={
          padCol(`Cholesterol: ${props.data.nutrients['Cholesterol'].amount}g`, `${props.data.nutrients['Cholesterol'].percentage * 100}%`, 24) +
          '\n'
        }
      />
      <text
        content={
          padCol(`Sodium: ${props.data.nutrients['Sodium'].amount}mg`, `${props.data.nutrients['Sodium'].percentage * 100}%`, 23) + '\n'
        }
      />

      <text
        content={
          padCol(`Total Carbs: ${props.data.nutrients['Total Carbohydrate'].amount}g`, `${props.data.nutrients['Total Carbohydrate'].percentage * 100}%`, 24) + '\n'
        }
      />
      <text
        content={padCol(`  Dietary Fiber: ${props.data.nutrients['Dietary Fiber'].amount}g`, `${props.data.nutrients['Dietary Fiber'].percentage * 100}%\n`, 26)}
      />
      <text content={`  Total Sugar: ${props.data.nutrients['Total Sugars'].amount}g\n`} />
      <text
        content={padCol(
          `    Add. Sugar: ${props.data.nutrients['Added Sugars'].amount}g`,
          `${props.data.nutrients['Added Sugars'].percentage * 100}%\n` || 0,
          25
        )}
      />
      <text content={`Protein: ${props.data.nutrients['Protein'].amount}g\n`} />
      <text fontSize={0.045} content={`-------------------------\n`} />
      <text
        content={
          padCol(`Vit. D:`, `${props.data.nutrients['Vitamin D'].percent * 100}%`, 10) +
          ' | ' +
          padCol(`Calcium:`, `${props.data.nutrients['Calcium'].percent * 100}%`, 12) + '\n'
        }
      />
      <text
        content={
          padCol(`Iron:`, `${props.data.nutrients['Iron'].percent * 100}%`, 10) +
          ' | ' +
          padCol(`Pot.:`, `${props.data.nutrients['Potassium'].percent * 100}%`, 15) +
          '\n'
        }
      />
    </block>
  )
}

const ItemViewBlock = () => {
  return (
    <block
      args={[
        {
          width: 0.625,
          height: 0.825,
          fontSize: 0.045,
          backgroundOpacity: 0.0,
          padding: 0.025
        }
      ]}></block>
  )
}
const IngredientText = (props) => {
  return (
      <block
      args={[
        {
          width: 0.55,
          height: 2.5,
          fontSize: 0.045,
          fontFamily: props.FontJSON,
          fontTexture: props.FontImage,
        }
      ]}>
      <text content={props.data.ingredientList} />
    </block>
  )
}

const IngredientBlock = (props) => {
  const { gl } = useThree()

  gl.localClippingEnabled = true
  return (
    <block
      args={[
        {
          width: 0.6,
          height: 0.9,
          fontSize: 0.045,
          backgroundOpacity: 0.5,
          padding: 0.025,
          textAlign: 'left',
          hiddenOverflow: 'true',
          fontFamily: props.FontJSON,
          fontTexture: props.FontImage,
        }
      ]}>
      
        <IngredientText data={props.data}/>
      
    </block>
  )
}

const TagBlock = (props) => {
  return (
    <block
      args={[
        {
          width: 0.7,
          height: 0.25,
          fontSize: 0.015,
          interLine: 0.0004,
          padding: 0.015,
          margin: 0.015,
          backgroundOpacity: 0.5,
          alignItems: 'start'
        }
      ]}>
      <text fontSize={0.045} content={`${props.title}:\n`} />
      {props.values.map((val) => {
        if (props.title === 'Allergens') {
          console.log(val)
          return <text fontSize={0.045} content={`| ${val.name} |`} key={val.name + new Date().getTime()} />
        } else if (props.title === 'Tags') {
          return <text fontSize={0.045} content={`| ${val} |`} key={val + new Date().getTime()} />
        }
      })}
    </block>
  )
}

const InfoBlock = (props) => {
  return (
    <block
      args={[
        {
          width: 1.5,
          height: 0.3,
          fontSize: 0.065,
          interLine: 0.0004,
          padding: 0.005,
          margin: 0.025,
          backgroundOpacity: 0.5,
          alignItems: 'center',
          contentDirection: 'row'
        }
      ]}>
      <TagBlock title="Allergens" values={props.data.allergens} />
      <TagBlock title="Tags" values={props.data.tags} />
    </block>
  )
}

export const InfoMenu = (props) => {
  const itemData = props.data
  
  console.log("menu pos", props.position)

  useEffect(() => {
    if (props.menuVis) {
      props.menuRef.current.rotation.x = -.55
      props.menuRef.current.update(true, true, true)
      console.log("Menu:", props.menuRef.current)
    }
  }, [props.menuVis])

  useFrame(() => {
    //console.log("update loop", props.menuRef.current)
    //console.log("update loop font", props.menuRef.current.fontFamily)
    try {
      ThreeMeshUI.update()
      
    } catch (error) {
      console.log(error)
    }
  })
  return (
    <block
      position={props.position.clone()}
      scale={(0.4, 0.4, 0.4)}
      ref={props.menuRef}
      args={[
        {
          width: 1.05 + 0.75,
          height: 1.45,
          backgroundOpacity: 0.0,
          fontFamily: props.FontJSON,
          fontTexture: props.FontImage,
          alignItems: 'center',
        }
      ]}>
      <Title name={itemData.name} brand={itemData.brand} servings={itemData.servings} />

      <block
        args={[
          {
            width: 1.05 + 0.75,
            height: 0.9,
            backgroundOpacity: 0.0,
            contentDirection: 'row',
            alignItems: 'top',
          }
        ]}>
        <NutritionBlock data={itemData} />
        <ItemViewBlock />
        <IngredientBlock data={itemData} />
      </block>
      <InfoBlock data={itemData} />
    </block>
  )
}