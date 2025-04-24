import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import Icon from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import { useApi } from "@/hooks/useApi";
const difficultyOptions = ["Easy", "Medium", "Hard"];
const categoryOptions = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Health", "Recipes", "Inspiration", "Budget", "Baking"];
import { API_URL } from "../../config";
import * as ImagePicker from 'expo-image-picker';
import mime from 'mime';


export default function CreateScreen() {
  const { apiCall } = useApi();

  const [pickedImageUri, setPickedImageUri] = useState("");

  const pickAndUploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      setPickedImageUri(image.uri);
      console.log("picked image, click upload image to continue")
    }
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [instructions, setInstructions] = useState([""]);
  const [ingredients, setIngredients] = useState<{ quantity: string; name: string }[]>([
    { quantity: '', name: '' }
  ]);

  const handleDifficultySelect = (level: string) => {
    setSelectedDifficulty(level === selectedDifficulty ? null : level);
  };

  const handleCategorySelect = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleInstructionChange = (text: string, index: number) => {
    const newInstructions = [...instructions];
    newInstructions[index] = text;
    setInstructions(newInstructions);
  };

  const handleIngredientChange = (index: number, field: 'quantity' | 'name', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };
  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const newInstructions = instructions.filter((_, i) => i !== index);
      setInstructions(newInstructions);
    }
  };
  const addIngredient = () => {
    setIngredients([...ingredients, { quantity: '', name: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  const categoryMapping: { [key: string]: number } = {
    Breakfast: 6,
    Lunch: 8,
    Dinner: 7,
    Dessert: 10,
    Snack: 9,
    Health: 2,
    Recipes: 1,
    Inspiration: 3,
    Budget: 4,
    Baking: 5,
  };

  const handleImageUpload = async () => {
    if (!pickedImageUri) {
      alert("Please pick an image first.");
      return;
    }

    const mimeType = mime.getType(pickedImageUri) || "image/jpeg";
    try {
      const res = await apiCall(`${API_URL}/recipes/generate-presigned-url`);
      const { upload_url, image_url } = await res.json();
      console.log("Generated Image URL:", image_url);

      const imageBlob = await (await fetch(pickedImageUri)).blob();
      const uploadRes = await fetch(upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": mimeType,
        },
        body: imageBlob,
      });

      if (!uploadRes.ok) {
        alert("Failed to upload image.");
        return;
      }

      // Successfully uploaded image, now set the image URL
      setImageUrl(image_url);
      console.log("image uploaded successfully")
    } catch (err) {
      console.error("Error uploading image", err);
      alert("An error occurred during the image upload.");
    }
  };


  const handleSubmit = async () => {
    if (!imageUrl) {
      alert("Please upload an image first.");
      return;
    }

    try {
      const recipeData = {
        title,
        description,
        ingredients,
        instructions: instructions.join("\n"),
        prep_time: prepTime,
        cook_time: cookTime,
        difficulty: selectedDifficulty,
        category_ids: selectedCategories.map(c => categoryMapping[c]),
        image_url: imageUrl, 
      };

      const response = await apiCall(`${API_URL}/recipes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      });

      if (!response || !response.ok) {
        throw new Error("Failed to create recipe");
      }

      const result = await response.json();
      console.log('Recipe created successfully:', result);
    } catch (error) {
      console.error('Error creating recipe:', error.message);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Create a New Recipe</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter recipe title"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter a short description"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {/* Ingredients */}
        <Text style={styles.label}>Ingredients</Text>
        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.row}>
            <View style={styles.ingredientInputs}>
              <TextInput
                style={[styles.input, styles.quantityInput]}
                placeholder="Qty"
                value={ingredient.quantity}
                onChangeText={(text) => handleIngredientChange(index, 'quantity', text)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="Ingredient"
                value={ingredient.name}
                onChangeText={(text) => handleIngredientChange(index, 'name', text)}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => removeIngredient(index)}
              >
                <Icon name="minuscircleo" size={24} color="#D98324" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={addIngredient}
              >
                <Icon name="pluscircleo" size={24} color="#D98324" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Instructions */}
        <Text style={styles.label}>Instructions</Text>
        {instructions.map((instr, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.instructionNumber}>{index + 1}.</Text>
            <TextInput
              style={[styles.input, styles.instructionInput]}
              placeholder="Instruction step"
              value={instr}
              onChangeText={(text) => handleInstructionChange(text, index)}
              multiline
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => removeInstruction(index)}
              >
                <Icon name="minuscircleo" size={24} color="#D98324" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={addInstruction}
              >
                <Icon name="pluscircleo" size={24} color="#D98324" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Image Upload Buttons */}
        <View style={styles.imageButtonsContainer}>
          <TouchableOpacity style={styles.pickImageButton} onPress={pickAndUploadImage}>
            <Text style={styles.buttonText}>Select Image</Text>
          </TouchableOpacity>
          <View style={{ width: 10 }} /> {/* Add some space between the buttons */}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleImageUpload}
            disabled={!pickedImageUri}
          >
            <Text style={styles.buttonText}>Upload Image</Text>
          </TouchableOpacity>
        </View>

        {pickedImageUri ? (
          <Image source={{ uri: pickedImageUri }} style={styles.recipeImage} />
        ) : null}

        <Text style={styles.label}>Prep Time (minutes)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 15"
          keyboardType="numeric"
          value={prepTime}
          onChangeText={setPrepTime}
        />

        <Text style={styles.label}>Cook Time (minutes)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 30"
          keyboardType="numeric"
          value={cookTime}
          onChangeText={setCookTime}
        />

        {/* Difficulty */}
        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.chipsContainer}>
          {difficultyOptions.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.chip,
                selectedDifficulty === level && styles.chipSelected,
              ]}
              onPress={() => handleDifficultySelect(level)}
            >
              <Text style={selectedDifficulty === level ? styles.chipTextSelected : styles.chipText}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipsContainer}>
          {categoryOptions.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.chip,
                selectedCategories.includes(category) && styles.chipSelected,
              ]}
              onPress={() => handleCategorySelect(category)}
            >
              <Text style={selectedCategories.includes(category) ? styles.chipTextSelected : styles.chipText}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}

        </View>

        {/* Submit Recipe Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={!imageUrl} // Disable submit button until image is uploaded
        >
          <Text style={styles.buttonText}>Submit Recipe</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5E9",
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 100
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: "#D98324",
  },
  chipText: {
    color: "#555",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  instructionNumber: {
    fontSize: 16,
    marginRight: 8,
  },
  instructionInput: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: "#D98324",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  recipeImage: {
    width: 200,
    height: 200,
    resizeMode: "cover",
    borderRadius: 8,
    marginVertical: 16,
  },
  ingredientInputs: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  quantityInput: {
    flex: 0.3,
  },
  nameInput: {
    flex: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 20,
    marginBottom: 10,
  },
  pickImageButton: {
    backgroundColor: '#D98324',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    backgroundColor: '#D98324',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});