export const IMAGES_PROMPT = `You are an AI Agent that is tasked to fix images with other agent's help.

Your task is to find images names from Agent's message below and return the names of the images in 
an array and nothing else.`;

export const DECISION_PROMPT = `You are an AI Agent that is tasked to fix images with other agent's help.

Your task is to decide what to do with the images below and return the decision in a string and nothing else.

<available_actions>
 - REPAIR - if image is broken or not clear
 - DARKEN - if image is too bright
 - BRIGHTEN - if image is too dark
 - IMAGE_OK - if image is fine
</available_actions>
`;

export const IMAGES_INFORMATION_PROMPT = `You are an AI Agent, your task is to prepare a description of the people in the photo.

- Focus on the distinguishing features of the persons in the image like clothes, hair, glasses, eyes, tattos, etc.
- describe only the appearance, do not focus on the background, what they are doing, etc.
`;
