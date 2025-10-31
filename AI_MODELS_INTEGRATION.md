# AI Models Integration Guide

This document explains how to integrate your trained AI models into MedScan Africa.

## Overview

The application supports three types of medical scans:
- **Brain MRI** - CNN for tumor detection
- **Heart Scans** - CNN for cardiac disease detection
- **Eye Scans** - CNN for diabetic retinopathy and glaucoma detection

## Model Service Location

The AI model integration code is located at:
```
/services/aiModelService.ts
```

## Current Implementation

The service currently uses **placeholder mock predictions** for demonstration purposes. You need to replace these with your actual trained models.

## Integration Steps

### Step 1: Prepare Your Models

Convert your trained models to **TensorFlow Lite (.tflite)** format:

```python
import tensorflow as tf

# Load your Keras model
model = tf.keras.models.load_model('brain_model.h5')

# Convert to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

# Save the model
with open('brain_model.tflite', 'wb') as f:
    f.write(tflite_model)
```

### Step 2: Add Models to Project

Create an `assets/models/` directory and place your `.tflite` files:

```
assets/
  models/
    brain_cnn_v1.tflite
    heart_cnn_v1.tflite
    eye_cnn_v1.tflite
```

### Step 3: Install TensorFlow Lite for React Native

```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
npm install expo-gl
```

### Step 4: Update aiModelService.ts

Replace the mock implementation with actual TensorFlow Lite inference:

```typescript
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

class AIModelService {
  private brainModel: tf.LayersModel | null = null;
  private heartModel: tf.LayersModel | null = null;
  private eyeModel: tf.LayersModel | null = null;

  async loadModels() {
    await tf.ready();

    // Load brain model
    this.brainModel = await tf.loadLayersModel(
      bundleResourceIO(require('../assets/models/brain_cnn_v1.tflite'))
    );

    // Load heart model
    this.heartModel = await tf.loadLayersModel(
      bundleResourceIO(require('../assets/models/heart_cnn_v1.tflite'))
    );

    // Load eye model
    this.eyeModel = await tf.loadLayersModel(
      bundleResourceIO(require('../assets/models/eye_cnn_v1.tflite'))
    );
  }

  async analyzeScan(scanType: ScanType, imageUri: string): Promise<ModelPrediction> {
    // Preprocess image
    const imageTensor = await this.preprocessImage(imageUri);

    let prediction;
    switch (scanType) {
      case 'brain':
        prediction = await this.brainModel!.predict(imageTensor);
        break;
      case 'heart':
        prediction = await this.heartModel!.predict(imageTensor);
        break;
      case 'eye':
        prediction = await this.eyeModel!.predict(imageTensor);
        break;
    }

    // Process prediction results
    return this.processPrediction(prediction, scanType);
  }

  private async preprocessImage(imageUri: string): Promise<tf.Tensor> {
    // Load and preprocess image
    const response = await fetch(imageUri);
    const imageData = await response.arrayBuffer();
    const imageTensor = tf.browser.fromPixels(imageData);

    // Resize to model input size (e.g., 224x224)
    const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);

    // Normalize pixel values
    const normalized = resized.div(255.0);

    // Add batch dimension
    return normalized.expandDims(0);
  }

  private processPrediction(prediction: any, scanType: ScanType): ModelPrediction {
    // Extract prediction values
    const probabilities = prediction.dataSync();
    const confidence = Math.max(...probabilities);

    // Map to conditions based on your model's output classes
    // This is an example - adjust based on your model architecture
    const conditionMap = {
      brain: ['Normal', 'Glioma', 'Meningioma', 'Pituitary Tumor'],
      heart: ['Normal', 'Dilated Cardiomyopathy', 'Myocardial Infarction'],
      eye: ['Normal', 'Diabetic Retinopathy', 'Glaucoma']
    };

    const maxIndex = probabilities.indexOf(confidence);
    const condition = conditionMap[scanType][maxIndex];

    // Determine risk level
    let riskLevel: RiskLevel = 'low';
    if (confidence > 0.9 && maxIndex > 0) riskLevel = 'high';
    else if (confidence > 0.7 && maxIndex > 0) riskLevel = 'medium';

    return {
      confidence,
      condition,
      riskLevel,
      recommendation: this.getRecommendation(condition, riskLevel),
      modelVersion: `${scanType}-cnn-v1.0.0`
    };
  }
}
```

### Step 5: Implement Grad-CAM Heatmaps

For visualization of model attention areas:

```typescript
async generateHeatmap(scanType: ScanType, imageUri: string): Promise<string | null> {
  // Load the image
  const imageTensor = await this.preprocessImage(imageUri);

  // Get the last convolutional layer
  const model = this.getModel(scanType);
  const lastConvLayer = model.getLayer('last_conv_layer_name');

  // Create a model that outputs both predictions and conv layer output
  const gradModel = tf.model({
    inputs: model.inputs,
    outputs: [lastConvLayer.output, model.output]
  });

  // Compute gradients
  const [convOutputs, predictions] = gradModel.predict(imageTensor);

  // Generate heatmap
  // ... implement Grad-CAM algorithm

  // Save and return heatmap URL
  return heatmapUrl;
}
```

## Model Requirements

### Input Format
- Image size: 224x224 pixels (or your model's input size)
- Color space: RGB
- Normalization: [0, 1] range

### Output Format
Your models should output:
- **Classification probabilities** for each condition
- Confidence scores between 0 and 1

### Training Datasets

Recommended datasets for training:

**Brain MRI:**
- Brain Tumor MRI Dataset (Kaggle)
- BraTS (Brain Tumor Segmentation)

**Heart Scans:**
- ACDC (Automated Cardiac Diagnosis Challenge)
- CDEMRIS Dataset

**Eye Scans:**
- ODIR-5K (Ocular Disease Intelligent Recognition)
- EyePACS (Diabetic Retinopathy Detection)

## Performance Optimization

### Model Optimization
```python
# Optimize model for mobile
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]
tflite_model = converter.convert()
```

### Quantization
```python
# Post-training quantization
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.representative_dataset = representative_dataset_gen
converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
```

## Testing Your Models

Create test cases in your development environment:

```typescript
// Test brain model
const result = await aiModelService.analyzeScan('brain', testImageUri);
console.log('Brain scan result:', result);

// Validate predictions
expect(result.confidence).toBeGreaterThan(0.7);
expect(result.riskLevel).toBeDefined();
```

## Model Versioning

Update the `model_versions` table when deploying new models:

```sql
INSERT INTO model_versions (model_type, version, accuracy, file_path, is_active)
VALUES ('brain', 'v2.0.0', 0.95, 'assets/models/brain_cnn_v2.tflite', true);
```

## Error Handling

Implement robust error handling:

```typescript
try {
  const result = await aiModelService.analyzeScan(scanType, imageUri);
  return result;
} catch (error) {
  console.error('Model inference error:', error);
  // Fallback to server-side inference or show error
  throw new Error('Failed to analyze scan. Please try again.');
}
```

## Performance Benchmarks

Expected inference times on mobile devices:
- Brain MRI: 2-4 seconds
- Heart Scan: 2-4 seconds
- Eye Scan: 1-3 seconds

## Support

For issues with model integration, check:
1. Model file format (.tflite)
2. Input preprocessing matches training
3. Output shape matches expected format
4. TensorFlow.js is properly initialized
