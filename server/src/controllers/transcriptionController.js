const transcribe = async (req, res, next) => {
  try {
    const apiKey = process.env.DeepGram_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Deepgram API key not configured' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioBuffer = req.file.buffer;

    // Send to Deepgram for transcription
    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': req.file.mimetype || 'audio/webm'
      },
      body: audioBuffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepgram error:', response.status, errorText);

      // Check for common error codes
      if (response.status === 402 || errorText.includes('insufficient') || errorText.includes('credits') || errorText.includes('balance')) {
        return res.status(402).json({
          error: 'DEEPGRAM_NO_CREDITS',
          message: 'Deepgram credits exhausted. Please add more credits to your Deepgram account.'
        });
      }

      if (response.status === 401 || response.status === 403) {
        return res.status(response.status).json({
          error: 'DEEPGRAM_AUTH_ERROR',
          message: 'Deepgram API key is invalid or unauthorized.'
        });
      }

      return res.status(response.status).json({
        error: 'TRANSCRIPTION_FAILED',
        message: 'Transcription failed. Please try again.'
      });
    }

    const data = await response.json();
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    res.json({ transcript });
  } catch (error) {
    console.error('Transcription error:', error);
    next(error);
  }
};

module.exports = { transcribe };
