# Model Placement & Integration Guide

## Quick Reference: Where to Place Your AI Models

This guide shows you exactly where to place your trained CNN models in the MedScan Africa codebase.

## 📂 Directory Structure

Create this directory structure for your models:

```
medscan-africa/
└── assets/
    └── models/
        ├── brain/
        │   ├── brain_cnn_v1.tflite        # Your brain tumor detection model
        │   ├── model_config.json          # Model metadata
        │   └── labels.txt                 # Class labels
        ├── heart/
        │   ├── heart_cnn_v1.tflite        # Your cardiac disease model
        │   ├── model_config.json
        │   └── labels.txt
        └── eye/
            ├── eye_cnn_v1.tflite          # Your eye disease model
            ├── model_config.json
            └── labels.txt
```

## 🎯 Step-by-Step Integration

### Step 1: Create Directory Structure

```bash
mkdir -p assets/models/brain
mkdir -p assets/models/heart
mkdir -p assets/models/eye
```

### Step 2: Add Your Model Files

Copy your trained `.tflite` models to the appropriate directories:

```bash
# Example commands
cp /path/to/your/brain_model.tflite assets/models/brain/brain_cnn_v1.tflite
cp /path/to/your/heart_model.tflite assets/models/heart/heart_cnn_v1.tflite
cp /path/to/your/eye_model.tflite assets/models/eye/eye_cnn_v1.tflite
```

### Step 3: Create Model Configuration Files

Create `model_config.json` for each model:

**brain/model_config.json:**
```json
{
  "model_name": "Brain Tumor Detection CNN",
  "version": "1.0.0",
  "input_shape": [224, 224, 3],
  "output_classes": 4,
  "labels": ["Normal", "Glioma", "Meningioma", "Pituitary Tumor"],
  "preprocessing": {
    "resize": [224, 224],
    "normalize": true,
    "mean": [0.485, 0.456, 0.406],
    "std": [0.229, 0.224, 0.225]
  },
  "performance": {
    "accuracy": 0.95,
    "f1_score": 0.93,
    "inference_time_ms": 250
  }
}
```

**heart/model_config.json:**
```json
{
  "model_name": "Cardiac Disease Detection CNN",
  "version": "1.0.0",
  "input_shape": [224, 224, 3],
  "output_classes": 3,
  "labels": ["Normal", "Dilated Cardiomyopathy", "Myocardial Infarction"],
  "preprocessing": {
    "resize": [224, 224],
    "normalize": true,
    "mean": [0.485, 0.456, 0.406],
    "std": [0.229, 0.224, 0.225]
  },
  "performance": {
    "accuracy": 0.92,
    "f1_score": 0.90,
    "inference_time_ms": 280
  }
}
```

**eye/model_config.json:**
```json
{
  "model_name": "Eye Disease Detection CNN",
  "version": "1.0.0",
  "input_shape": [224, 224, 3],
  "output_classes": 3,
  "labels": ["Normal", "Diabetic Retinopathy", "Glaucoma"],
  "preprocessing": {
    "resize": [224, 224],
    "normalize": true,
    "mean": [0.485, 0.456, 0.406],
    "std": [0.229, 0.224, 0.225]
  },
  "performance": {
    "accuracy": 0.96,
    "f1_score": 0.94,
    "inference_time_ms": 200
  }
}
```

### Step 4: Create Labels Files

**brain/labels.txt:**
```
Normal
Glioma
Meningioma
Pituitary Tumor
```

**heart/labels.txt:**
```
Normal
Dilated Cardiomyopathy
Myocardial Infarction
```

**eye/labels.txt:**
```
Normal
Diabetic Retinopathy
Glaucoma
```

## 📝 Update Service Code

### Location: `services/aiModelService.ts`

Replace the mock implementation with your model loading code:

```typescript
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

// Load model configurations
import brainConfig from '../assets/models/brain/model_config.json';
import heartConfig from '../assets/models/heart/model_config.json';
import eyeConfig from '../assets/models/eye/model_config.json';

class AIModelService {
  private brainModel: tf.LayersModel | null = null;
  private heartModel: tf.LayersModel | null = null;
  private eyeModel: tf.LayersModel | null = null;

  async loadModels() {
    console.log('Loading AI models...');

    try {
      // Initialize TensorFlow.js
      await tf.ready();

      // Load brain model
      this.brainModel = await tf.loadLayersModel(
        bundleResourceIO(require('../assets/models/brain/brain_cnn_v1.tflite'))
      );
      console.log('Brain model loaded');

      // Load heart model
      this.heartModel = await tf.loadLayersModel(
        bundleResourceIO(require('../assets/models/heart/heart_cnn_v1.tflite'))
      );
      console.log('Heart model loaded');

      // Load eye model
      this.eyeModel = await tf.loadLayersModel(
        bundleResourceIO(require('../assets/models/eye/eye_cnn_v1.tflite'))
      );
      console.log('Eye model loaded');

      console.log('All models loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
      throw error;
    }
  }

  // Rest of your implementation...
}
```

## 🔧 Model Format Requirements

### Input Requirements

Your models should accept:
- **Input shape:** `[batch_size, height, width, channels]`
- **Image dimensions:** 224x224 (or specify in config)
- **Color channels:** 3 (RGB)
- **Data type:** float32
- **Value range:** [0, 1] normalized

### Output Requirements

Your models should output:
- **Output shape:** `[batch_size, num_classes]`
- **Data type:** float32
- **Value range:** [0, 1] (probabilities)
- **Format:** Softmax activation on final layer

### Example Model Architecture

```python
# Example Keras model structure
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
    MaxPooling2D((2, 2)),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Conv2D(128, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Flatten(),
    Dense(128, activation='relu'),
    Dropout(0.5),
    Dense(num_classes, activation='softmax')
])
```

## 🎨 Grad-CAM Heatmap Files (Optional)

If you want to add pre-generated heatmaps:

```
assets/
└── models/
    ├── brain/
    │   └── sample_heatmaps/
    │       ├── normal_sample.png
    │       ├── glioma_sample.png
    │       └── meningioma_sample.png
    ├── heart/
    │   └── sample_heatmaps/
    └── eye/
        └── sample_heatmaps/
```

## 🗄️ Register Models in Database

After adding your models, register them in Supabase:

```sql
-- Register brain model
INSERT INTO model_versions (model_type, version, accuracy, file_path, is_active, deployed_at)
VALUES (
  'brain',
  'v1.0.0',
  0.95,
  'assets/models/brain/brain_cnn_v1.tflite',
  true,
  NOW()
);

-- Register heart model
INSERT INTO model_versions (model_type, version, accuracy, file_path, is_active, deployed_at)
VALUES (
  'heart',
  'v1.0.0',
  0.92,
  'assets/models/heart/heart_cnn_v1.tflite',
  true,
  NOW()
);

-- Register eye model
INSERT INTO model_versions (model_type, version, accuracy, file_path, is_active, deployed_at)
VALUES (
  'eye',
  'v1.0.0',
  0.96,
  'assets/models/eye/eye_cnn_v1.tflite',
  true,
  NOW()
);
```

## ✅ Verification Checklist

Before testing your models:

- [ ] Models are in TensorFlow Lite (.tflite) format
- [ ] Model files are placed in correct directories
- [ ] model_config.json files are created
- [ ] labels.txt files match your model outputs
- [ ] Input dimensions match your training configuration
- [ ] Output classes match your labels
- [ ] Models are optimized for mobile (quantized if possible)
- [ ] Database entries created in model_versions table

## 🧪 Testing Your Models

### Test Script Example

Create `scripts/test_models.ts`:

```typescript
import { aiModelService } from '../services/aiModelService';

async function testModels() {
  console.log('Loading models...');
  await aiModelService.loadModels();

  // Test brain model
  console.log('Testing brain model...');
  const brainResult = await aiModelService.analyzeScan(
    'brain',
    'path/to/test/brain/image.jpg'
  );
  console.log('Brain result:', brainResult);

  // Test heart model
  console.log('Testing heart model...');
  const heartResult = await aiModelService.analyzeScan(
    'heart',
    'path/to/test/heart/image.jpg'
  );
  console.log('Heart result:', heartResult);

  // Test eye model
  console.log('Testing eye model...');
  const eyeResult = await aiModelService.analyzeScan(
    'eye',
    'path/to/test/eye/image.jpg'
  );
  console.log('Eye result:', eyeResult);
}

testModels().catch(console.error);
```

## 📊 Model Performance Benchmarks

Track these metrics after integration:

### Inference Time
- Target: < 3 seconds on mid-range mobile device
- Measure: Average time from image input to prediction output

### Memory Usage
- Target: < 200 MB RAM during inference
- Measure: Peak memory usage during model execution

### Battery Impact
- Target: < 5% battery drain per scan
- Measure: Battery consumption during scan analysis

### Accuracy Metrics
- Track real-world accuracy vs training accuracy
- Monitor false positive/negative rates
- Collect user feedback on predictions

## 🔄 Model Update Process

When updating models:

1. **Create new version directory:**
   ```
   assets/models/brain_v2/
   ```

2. **Update model_config.json with new version:**
   ```json
   {
     "version": "2.0.0",
     ...
   }
   ```

3. **Test new model thoroughly**

4. **Update database:**
   ```sql
   -- Deactivate old model
   UPDATE model_versions SET is_active = false WHERE model_type = 'brain' AND version = 'v1.0.0';

   -- Add new model
   INSERT INTO model_versions (...) VALUES (...);
   ```

5. **Deploy update to users**

## 📞 Support

If you encounter issues:

1. Check model file format (.tflite required)
2. Verify input/output shapes match configuration
3. Test models locally before deployment
4. Check error logs in `services/aiModelService.ts`
5. Refer to `AI_MODELS_INTEGRATION.md` for detailed integration steps

## 🎯 Quick Start Checklist

To integrate your models today:

1. ✅ Create `assets/models/` directory structure
2. ✅ Copy your 3 .tflite model files
3. ✅ Create model_config.json for each model
4. ✅ Update `services/aiModelService.ts` with model loading code
5. ✅ Test with sample images
6. ✅ Register models in database
7. ✅ Deploy and test in app

**You're ready to integrate your models!** 🚀
