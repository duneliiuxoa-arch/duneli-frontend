/**
 * Example: Integrating Firebase with Homepage Components
 * 
 * This shows how to connect your existing homepage UI with:
 * - Real-time live topics
 * - Upcoming discussions
 * - Creating new topics
 */

import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useLiveTopics } from '../hooks/useDiscussion';
import {
  createTopic,
  createDiscussion,
  expressInterest,
  getUpcomingTopics,
} from '../services/discussionService';

export const IntegratedHomepage: React.FC = () => {
  const { user, anonymousId, isAuthenticated } = useAuthContext();
  const { topics: liveTopics, loading } = useLiveTopics();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [upcomingTopics, setUpcomingTopics] = useState<any[]>([]);

  // Load upcoming topics on mount
  React.useEffect(() => {
    const loadUpcoming = async () => {
      const topics = await getUpcomingTopics();
      setUpcomingTopics(topics);
    };
    loadUpcoming();
  }, []);

  // Handle creating new topic
  const handleCreateTopic = async (title: string, category: string, scheduledDate?: Date) => {
    if (!user) {
      alert('Please sign in to create a topic');
      return;
    }

    try {
      const topicId = await createTopic(title, category, user.uid, scheduledDate || null);
      
      // If not scheduled, create discussion immediately
      if (!scheduledDate) {
        const discussionId = await createDiscussion(topicId);
        // Navigate to discussion
        window.location.href = `/meeting/${discussionId}`;
      } else {
        alert('Topic scheduled successfully!');
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Failed to create topic');
    }
  };

  // Handle joining discussion
  const handleJoinDiscussion = async (topicId: string) => {
    if (!isAuthenticated) {
      alert('Please sign in to join discussions');
      return;
    }

    try {
      // Create or get discussion for this topic
      const discussionId = await createDiscussion(topicId);
      // Navigate to discussion
      window.location.href = `/meeting/${discussionId}`;
    } catch (error) {
      console.error('Error joining discussion:', error);
      alert('Failed to join discussion');
    }
  };

  // Handle expressing interest
  const handleExpressInterest = async (topicId: string) => {
    if (!user) {
      alert('Please sign in to express interest');
      return;
    }

    try {
      await expressInterest(topicId, user.uid);
      alert('Interest recorded!');
    } catch (error) {
      console.error('Error expressing interest:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading discussions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">DUNELI</h1>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  {anonymousId}
                </span>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  + Create Topic
                </button>
              </>
            ) : (
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Philosophy Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            Ideas compete, not people
          </h2>
          <p className="text-blue-800">
            DUNELI is not social media. It's a structured platform for meaningful audio discussions.
          </p>
        </div>

        {/* Happening Now */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🔴 Happening Now</h2>
          {liveTopics.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">No live discussions at the moment</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-blue-600 hover:underline"
              >
                Start a discussion
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      LIVE
                    </span>
                    <span className="text-xs text-gray-500">{topic.category}</span>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-3">{topic.title}</h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {topic.interestCount} interested
                    </span>
                    <button
                      onClick={() => handleJoinDiscussion(topic.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Discussions */}
        <section>
          <h2 className="text-2xl font-bold mb-4">📅 Upcoming Discussions</h2>
          {upcomingTopics.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">No upcoming discussions scheduled</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      UPCOMING
                    </span>
                    <span className="text-xs text-gray-500">{topic.category}</span>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2">{topic.title}</h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {topic.scheduledAt?.toDate().toLocaleString()}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {topic.interestCount} interested
                    </span>
                    <button
                      onClick={() => handleExpressInterest(topic.id)}
                      disabled={!isAuthenticated}
                      className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 disabled:opacity-50"
                    >
                      Interested
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Ad Placeholder (Homepage Only) */}
        <div className="mt-8 bg-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500">Advertisement Space</p>
        </div>
      </main>

      {/* Create Topic Modal */}
      {showCreateModal && (
        <CreateTopicModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTopic}
        />
      )}
    </div>
  );
};

// Simple Create Topic Modal Component
interface CreateTopicModalProps {
  onClose: () => void;
  onSubmit: (title: string, category: string, scheduledDate?: Date) => void;
}

const CreateTopicModal: React.FC<CreateTopicModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [scheduled, setScheduled] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    let scheduledDate: Date | undefined;
    if (scheduled && date && time) {
      scheduledDate = new Date(`${date}T${time}`);
    }

    onSubmit(title, category, scheduledDate);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Create New Topic</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3"
              placeholder="What should we discuss?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3"
            >
              <option>General</option>
              <option>Technology</option>
              <option>Politics</option>
              <option>Science</option>
              <option>Philosophy</option>
              <option>Business</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={scheduled}
                onChange={(e) => setScheduled(e.target.checked)}
              />
              <span className="text-sm font-medium">Schedule for later</span>
            </label>
          </div>

          {scheduled && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              {scheduled ? 'Schedule' : 'Create & Start'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
